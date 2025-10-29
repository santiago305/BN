<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FilterConfig extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'filters_config';

    protected $fillable = [
        'name',
        'working_hours',
        'captcha_type',
        'relogin_interval',
        'filter_url',
        'search_without_results',
    ];

    protected $casts = [
        'working_hours' => 'array',
        'search_without_results' => 'boolean',
    ];

    public function workers()
    {
        return $this->belongsToMany(Worker::class, 'worker_filters', 'filter_config_id', 'worker_id')
            ->withTimestamps();
    }
}
