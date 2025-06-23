<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProductApiController extends Controller
{
    public function index()
    {
        $products = Product::all();

        $response = Http::get('https://api.openweathermap.org/data/2.5/weather', [
            'q' => 'Tokyo',
            'appid' => '631f52e291855837b93b3cfed377f376',
            'units' => 'metric',
            'lang' => 'ja'
        ]);

        $weather = $response->json();

        return response()->json([
            'products' => $products,
            'weather' => $weather
        ]);
    }

    public function store(Request $request)
    {
        $validated=$request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|integer|min:0',
        ]);

        $product=Product::create($validated);

        return response()->json([
            'message' => '商品を追加しました',
            'product' => $product
        ]);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json([
            'product'=> $product
        ]);
    }

      public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|integer|min:0',
        ]);

        $product = Product::findOrFail($id);
        $product->update($validated);

        return response()->json([
            'message' => '商品を更新しました',
            'product' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => '商品を削除しました'
        ]);
    }
}