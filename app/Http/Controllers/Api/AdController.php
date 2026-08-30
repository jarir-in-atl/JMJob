<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\AdProvider;
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
        $rows = Fluent::table('ad_providers')
            ->where('enabled', '=', 1)
            ->orderBy('id', 'asc')
            ->get();

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
            ],
        ]);
    }

    /**
     * GET /api/ads/next (auth.api) — pick the next provider by weight.
     * Returns one provider or null if all disabled.
     */
    public function next(Request $request): Response
    {
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
}
