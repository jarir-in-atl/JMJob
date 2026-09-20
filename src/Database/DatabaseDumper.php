<?php
declare(strict_types=1);

namespace Nemesis\Database;

use Nemesis\Core\Database;
use PDO;

class DatabaseDumper {
    protected $pdo;
    protected string $driver;

    public function __construct() {
        $this->pdo = Database::connect();
        $this->driver = Database::getDriverName();
    }

    public function dump($filename) {
        $tables = $this->getTables();
        $sql = "-- Nemesis Database Dump\n";
        $sql .= "-- Generated at: " . date('Y-m-d H:i:s') . "\n\n";
        $sql .= $this->foreignKeys(false);

        foreach ($tables as $table) {
            $sql .= $this->dumpTableSchema($table);
            $sql .= $this->dumpTableData($table);
        }

        $sql .= $this->foreignKeys(true);

        return file_put_contents($filename, $sql);
    }

    protected function getTables() {
        return match ($this->driver) {
            'mysql' => $this->pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN),
            'sqlite' => $this->pdo->query(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
            )->fetchAll(PDO::FETCH_COLUMN),
            default => throw new \RuntimeException("Database dumps do not support the '{$this->driver}' driver."),
        };
    }

    protected function dumpTableSchema($table) {
        if ($this->driver === 'sqlite') {
            $stmt = $this->pdo->prepare(
                "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?"
            );
            $stmt->execute([$table]);
            $createTableSql = (string) $stmt->fetchColumn();
            if ($createTableSql === '') {
                throw new \RuntimeException("Could not read the SQLite schema for table '{$table}'.");
            }
        } else {
            $quotedTable = $this->quoteIdentifier($table);
            $stmt = $this->pdo->query("SHOW CREATE TABLE {$quotedTable}");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $createTableSql = $row['Create Table'] ?? '';
            if ($createTableSql === '') {
                throw new \RuntimeException("Could not read the MySQL schema for table '{$table}'.");
            }
        }

        $quotedTable = $this->quoteIdentifier($table);
        $sql = "-- Table structure for table {$quotedTable}\n";
        $sql .= "DROP TABLE IF EXISTS {$quotedTable};\n";
        $sql .= $createTableSql . ";\n\n";

        return $sql;
    }

    protected function dumpTableData($table) {
        $quotedTable = $this->quoteIdentifier($table);
        $stmt = $this->pdo->query("SELECT * FROM {$quotedTable}");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) {
            return "";
        }

        $sql = "-- Dumping data for table {$quotedTable}\n";
        foreach ($rows as $row) {
            $columns = array_keys($row);
            $escapedColumns = array_map(fn($col) => $this->quoteIdentifier($col), $columns);
            $values = array_values($row);
            $escapedValues = array_map(function($val) {
                if ($val === null) return "NULL";
                return $this->pdo->quote((string) $val);
            }, $values);

            $sql .= "INSERT INTO {$quotedTable} (" . implode(', ', $escapedColumns) . ") VALUES (" . implode(', ', $escapedValues) . ");\n";
        }
        $sql .= "\n";

        return $sql;
    }

    protected function foreignKeys(bool $enabled): string
    {
        if ($this->driver === 'sqlite') {
            return 'PRAGMA foreign_keys=' . ($enabled ? 'ON' : 'OFF') . ";\n\n";
        }

        return 'SET FOREIGN_KEY_CHECKS=' . ($enabled ? '1' : '0') . ";\n\n";
    }

    protected function quoteIdentifier(string $identifier): string
    {
        if ($this->driver === 'sqlite') {
            return '"' . str_replace('"', '""', $identifier) . '"';
        }

        return '`' . str_replace('`', '``', $identifier) . '`';
    }
}
