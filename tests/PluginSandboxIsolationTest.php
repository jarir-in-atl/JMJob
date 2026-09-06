<?php
declare(strict_types=1);

// Nemesis 7.1.1 | Tests for Gap 3 — PluginSandbox path validation
// Updated: 2026-08-30

namespace Tests\Unit;

use Nemesis\Testing\TestCase;
use Nemesis\Core\PluginSandbox;

class PluginSandboxIsolationTest extends TestCase
{
    public function tearDown(): void
    {
        // The sandbox must not modify request-wide open_basedir state.
    }

    public function test_has_permission_works(): void
    {
        $sandbox = new PluginSandbox('demo', ['filesystem', 'db']);
        $this->assertTrue($sandbox->hasPermission('filesystem'));
        $this->assertTrue($sandbox->hasPermission('db'));
        $this->assertFalse($sandbox->hasPermission('network'));
    }

    public function test_require_permission_throws_for_missing(): void
    {
        $sandbox = new PluginSandbox('demo', ['filesystem']);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/lacks permission: network/');
        $sandbox->requirePermission('network');
    }

    public function test_check_file_access_rejects_outside_base_path(): void
    {
        // Create a sandbox rooted at this project.
        $sandbox = new PluginSandbox('demo', ['filesystem']);

        // /etc/passwd must never be accessible.
        $this->expectException(\RuntimeException::class);
        $sandbox->checkFileAccess('/etc/passwd');
    }

    public function test_check_file_access_rejects_stream_wrappers(): void
    {
        $sandbox = new PluginSandbox('demo', ['filesystem']);

        $this->expectException(\RuntimeException::class);
        $sandbox->checkFileAccess('phar://malicious.phar/file');
    }

    public function test_check_file_access_rejects_null_bytes(): void
    {
        $sandbox = new PluginSandbox('demo', ['filesystem']);

        $this->expectException(\RuntimeException::class);
        $sandbox->checkFileAccess("/etc/passwd\0.txt");
    }

    public function test_check_file_access_rejects_relative_escape(): void
    {
        $sandbox = new PluginSandbox('demo', ['filesystem']);

        $this->expectException(\RuntimeException::class);
        $sandbox->checkFileAccess('../../../etc/passwd');
    }

    public function test_check_file_access_passes_for_existing_file_in_project(): void
    {
        $sandbox = new PluginSandbox('demo', ['filesystem']);

        // composer.json sits at the project root; realpath() will resolve it
        // and the sandbox should accept it.
        $ok = $sandbox->checkFileAccess(__DIR__ . '/../composer.json');
        $this->assertTrue($ok);
    }

    public function test_sandbox_does_not_leak_open_basedir_restrictions(): void
    {
        $before = ini_get('open_basedir') ?: '';
        $sandbox = new PluginSandbox('demo', ['filesystem']);
        $sandbox->run(function () use ($before) {
            // open_basedir is request-wide and must remain untouched.
            $this->assertSame(
                $before,
                ini_get('open_basedir') ?: '',
                'Sandbox must not change open_basedir inside the request.'
            );
        });

        $this->assertSame($before, ini_get('open_basedir') ?: '', 'Sandbox must not leak open_basedir state.');
    }
}
