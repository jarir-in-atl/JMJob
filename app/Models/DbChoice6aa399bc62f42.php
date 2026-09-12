<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;

class DbChoice6aa399bc62f42 extends Model
{
    protected $table = 'db_choice6aa399bc62f42s';

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
