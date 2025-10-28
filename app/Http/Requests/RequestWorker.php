<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestWorker extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a realizar esta solicitud.
     *
     * @return bool
     */
    public function authorize()
    {
        // Puedes colocar aquí una lógica de autorización si es necesario
        return true;
    }

    /**
     * Obtén las reglas de validación que se aplicarán a la solicitud.
     *
     * @return array
     */
    public function rules()
    {
        $rules = [
            'name' => 'required|string|max:255|unique:workers,name',
            'dni' => 'required|string|max:20|unique:workers,dni',
            'password' => 'required|string|min:4',
            'is_in_use' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ];

        // Si estamos actualizando un trabajador, omitimos la validación de "unique" para el nombre y el DNI
        if ($this->isMethod('patch') || $this->isMethod('put')) {
            $id = $this->route('worker'); // Obtener el ID del trabajador desde la ruta
            $rules['name'] = 'sometimes|string|max:255|unique:workers,name,' . $id;
            $rules['dni'] = 'sometimes|string|max:20|unique:workers,dni,' . $id;
            $rules['password'] = 'sometimes|string|min:4';
        }

        return $rules;
    }

    /**
     * Obtén los mensajes personalizados para las reglas de validación.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'dni.required' => 'El DNI es obligatorio.',
            'password.required' => 'La contraseña es obligatoria.',
        ];
    }
}
