<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $workerId = $this->route('id');

        return [
            'name' => 'sometimes|string|max:255|unique:workers,name,' . $workerId . ',id',
            'dni' => 'sometimes|string|max:20|unique:workers,dni,' . $workerId . ',id',
            'password' => 'sometimes|string|min:4',
            'is_in_use' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'Ya existe un trabajador con ese nombre.',
            'dni.unique' => 'Ya existe un trabajador con ese DNI.',
        ];
    }
}
