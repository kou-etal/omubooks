<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:255',
            'email'    => [
                'required','string','email','max:255','unique:users,email',
                
                'regex:/^[A-Za-z0-9._%+-]+@omu\.ac\.jp$/i',
            ],
            'password' => ['required','confirmed', Password::defaults()],
        ];
    }

    public function messages(): array
    {
        return [
            'email.regex' => '@omu.ac.jp のメールのみ利用できます。',
        ];
    }
}
