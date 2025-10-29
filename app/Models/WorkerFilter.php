<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkerFilter extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'worker_filters';

    protected $fillable = [
        'worker_id',
        'filter_config_id',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function filterConfig()
    {
        return $this->belongsTo(FilterConfig::class);
    }
}
