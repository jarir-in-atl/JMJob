<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;

class DbChoice6aae7910561be extends Model
{
    protected $table = 'db_choice6aae7910561bes';

    /**
     * Mass-assignable attributes.
     */
    protected $fillable = [];
    protected ?string $connection = 'analytics';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
    }
}
