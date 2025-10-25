<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthLandingController extends Controller
{
    // Single action controller: este método se ejecuta cuando se llama la ruta
    public function __invoke(): Response|RedirectResponse
    {
        // Si ya está logueado -> dashboard
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        // Si NO está logueado -> mostramos login (tu componente de login en Inertia)
        return Inertia::render('auth/login', [
            // props opcionales si tu página las necesita
        ]);
    }
}
