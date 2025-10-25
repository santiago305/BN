<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->id();

            // Nombre del usuario que usa la automatización (login / identificador)
            $table->string('name');

            // Password del usuario (SIEMPRE guardado en hash, nunca en texto plano)
            $table->string('password');

            // is_in_use:
            // Indica si esta cuenta está siendo usada EN ESTE MOMENTO por la automatización.
            // true  = la automatización está logueada / procesando con este usuario
            // false = libre, disponible para usar
            $table->boolean('is_in_use')->default(false);

            // is_active:
            // Indica si la cuenta sigue habilitada dentro del sistema.
            // true  = activa, se puede asignar a la automatización
            // false = deshabilitada / bloqueada / baja lógica
            $table->boolean('is_active')->default(true);

            $table->timestamps(); // created_at / updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
