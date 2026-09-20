<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\AdProvider;
use App\Models\User;
use App\Services\AdConfigurationService;
use App\Services\SettingService;
use Nemesis\Core\Fluent;

/**
 * AdController — ad provider configuration and rotation.
 *
 *   GET  /api/ads/config  — returns active providers + default config
 */
class AdController extends Controller
{
    /**
     * GET /api/ads/config (auth.api) — list active ad providers.
     */
    public function config(Request $request): Response
    {
        if ($guard = $this->bannedGuard($request->getMeta('auth.user'))) return $guard;
        $rows = SettingService::adNetworkEnabled()
            ? Fluent::table('ad_providers')
                ->where('enabled', '=', 1)
                ->orderBy('id', 'asc')
                ->get()
            : [];

        $providers = [];
        foreach ($rows as $row) {
            $providers[] = [
                'slug'                => $row['slug'],
                'name'                => $row['name'],
                'block_id'            => $row['block_id'],
                'reward_per_view'     => (float) $row['reward_per_view'],
                'min_duration_seconds'=> (int) $row['min_duration_seconds'],
                'weight'              => (int) $row['weight'],
            ];
        }

        return Response::json([
            'success' => true,
            'data'    => [
                'providers'      => $providers,
                'daily_limit'    => (int) (getenv('AD_DAILY_LIMIT') ?: 50),
                'min_duration'   => (int) (getenv('AD_MIN_DURATION_SECONDS') ?: 12),
                'default_reward' => (float) (getenv('AD_REWARD_PER_VIEW') ?: 0.005),
                'advertisement_system_enabled' => SettingService::advertisementSystemEnabled(),
                'video_ads_enabled' => SettingService::videoAdsEnabled(),
                'watch_earn_enabled' => (bool) SettingService::get('watch_earn_enabled', true),
                'reward_system_enabled' => SettingService::rewardSystemEnabled(),
                'ad_network_enabled' => SettingService::adNetworkEnabled(),
                'website_ads_enabled' => (bool) SettingService::get('website_ads_enabled', true),
                'app_ads_enabled' => (bool) SettingService::get('app_ads_enabled', true),
                'website_publisher_id' => (string) SettingService::get('website_publisher_id', ''),
                'app_publisher_id' => (string) SettingService::get('app_publisher_id', ''),
                'website_ad_units' => (array) SettingService::get('website_ad_units', []),
                'app_ad_units' => (array) SettingService::get('app_ad_units', []),
                'ad_frequency_seconds' => (int) SettingService::get('ad_frequency_seconds', 60),
                'placements' => AdConfigurationService::publicConfig(),
            ],
        ]);
    }

    /**
     * GET /api/ads/next (auth.api) — pick the next provider by weight.
     * Returns one provider or null if all disabled.
     */
    public function next(Request $request): Response
    {
        if ($guard = $this->bannedGuard($request->getMeta('auth.user'))) return $guard;
        if (!SettingService::advertisementSystemEnabled()
            || !SettingService::adNetworkEnabled()
            || !SettingService::rewardSystemEnabled()
            || !SettingService::get('watch_earn_enabled', true)) {
            return Response::json([
                'success' => false,
                'message' => 'The external ad reward system is currently disabled.',
            ], 403);
        }

        $provider = AdProvider::pickRandom();
        if ($provider === null) {
            return Response::json([
                'success' => true,
                'data'    => null,
                'message' => 'No active ad providers.',
            ]);
        }
        return Response::json([
            'success' => true,
            'data'    => [
                'slug'                => $provider->slug,
                'name'                => $provider->name,
                'block_id'            => $provider->block_id,
                'reward_per_view'     => (float) $provider->reward_per_view,
                'min_duration_seconds'=> (int) $provider->min_duration_seconds,
            ],
        ]);
    }

    private function bannedGuard(?User $user): ?Response
    {
        if ($user === null) {
            return Response::json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }
        if ($user !== null && $user->isBanned()) {
            return Response::json([
                'success' => false,
                'message' => 'This account is banned.',
                'error' => 'banned',
            ], 403);
        }
        return null;
    }
}
