<?php
declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

use Nemesis\Router\Router;
use Nemesis\Testing\TestCase;

class RouteCacheFreshnessTest extends TestCase
{
    public function testSourceRouteReplacesStaleCachedRoute(): void
    {
        $property = new \ReflectionProperty(Router::class, 'cachedPath');
        $property->setAccessible(true);
        $originalCachePath = $property->getValue();
        $cachePath = tempnam(sys_get_temp_dir(), 'jmjob-routes-');

        file_put_contents($cachePath, "<?php\nreturn " . var_export([[
            'method'      => 'GET',
            'uri'         => '/api/admin/settings',
            'action'      => ['LegacyAdminSettingsController', 'settings'],
            'middleware'  => ['legacy'],
            'name'        => null,
            'constraints' => [],
            'domain'      => null,
            'meta'        => [],
        ]], true) . ";\n");
        $property->setValue(null, $cachePath);

        try {
            $router = new Router();
            require base_path('routes/api.php');

            $matches = array_values(array_filter(
                $router->getRoutes(),
                static fn(array $route): bool => ($route['method'] ?? '') === 'GET'
                    && ($route['uri'] ?? '') === '/api/admin/settings'
            ));

            $this->assertCount(1, $matches);
            $this->assertSame(
                ['App\\Http\\Controllers\\Api\\AdminSettingsController', 'listSettings'],
                $matches[0]['action']
            );
            $this->assertSame(['cors', 'auth.api', 'admin'], $matches[0]['middleware']);
        } finally {
            $property->setValue(null, $originalCachePath);
            if (is_string($cachePath) && file_exists($cachePath)) {
                unlink($cachePath);
            }
        }
    }
}

$test = new RouteCacheFreshnessTest();

echo "--- Route Cache Freshness Test ---\n";
echo "Running testSourceRouteReplacesStaleCachedRoute... ";
$test->testSourceRouteReplacesStaleCachedRoute();
echo "PASS\n";
