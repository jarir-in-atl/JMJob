<?php

use Nemesis\Database\Migration;

class SeedCategoriesFromJson extends Migration
{
    public function up()
    {
        $commandPath = __DIR__ . '/../../app/Console/Commands/SeedCategoriesFromDataCommand.php';
        if (file_exists($commandPath)) {
            require_once $commandPath;
        }

        $cmd = new \App\Console\Commands\SeedCategoriesFromDataCommand();
        $cmd->handle();
    }

    public function down()
    {
        // Safe no-op on rollback to prevent data loss
    }
}
