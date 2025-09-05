<?php

namespace App\Http\Requests\Listings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateListingRequest extends FormRequest
{
    public function authorize(): bool { return auth()->check(); }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes','string','max:255'],
            'course_name' => ['sometimes','string','max:255'],
            'price'       => ['sometimes','integer','min:100','max:1000000'],
            'description' => ['sometimes','nullable','string','max:2000'],
            'status'      => ['sometimes','in:draft,active,sold,hidden'],
            'images'      => ['sometimes','array','max:3'],
            'images.*'    => ['file','image','mimes:jpg,jpeg,png,webp','max:5120'],
        ];
    }
}
