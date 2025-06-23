<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class CartApiController extends Controller
{
    public function show()
    {
        $cart = session()->get('cart', []);
        $cartArray = [];

    foreach ($cart as $id => $item) {
        $cartArray[] = array_merge(['id' => $id], $item);
    }

    return response()->json([
        'cart' => $cartArray
    ]);
}

    public function add($id, Request $request)
    {
        $quantity = $request->input('quantity', 1);
        $product = Product::findOrFail($id);
        $cart = session()->get('cart', []);

        if (isset($cart[$id])) {
            $cart[$id]['quantity']++;
        } else {
            $cart[$id] = [
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => $quantity,
            ];
        }

        session()->put('cart', $cart);
        return response()->json([
            'message'=>'商品を追加しました',
            'cart'=>$cart
        ]);
    }

    public function remove($id)
    {
        $cart = session()->get('cart', []);

        if (isset($cart[$id])) {
            unset($cart[$id]);
            session()->put('cart', $cart);
        }

        return response()->json([
            'message'=>'商品を削除しました',
            'cart'=>$cart
        ]);
    }


    public function clear()
    {
        session()->forget('cart');
        return response()->json([
            'message'=>'商品をすべて削除しました',
        ]);
    }
    }

