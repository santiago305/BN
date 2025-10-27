<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    // Nombre de la tabla en BD
    protected $table = 'workers';

    // Campos que se pueden llenar por asignación masiva (create, update)
    protected $fillable = [
        'name',
        'dni',
        'password',
        'is_in_use',
        'is_active',
    ];

    // Casting a boolean para que Laravel te los devuelva como true/false reales
    protected $casts = [
        'is_in_use' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Ocultamos el password cuando hagas return JSON para no exponer el hash
    protected $hidden = [
        'password',
    ];
}
