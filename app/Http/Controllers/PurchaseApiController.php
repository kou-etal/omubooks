<?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Mail;
    use App\Mail\OrderShipped;
    
    class PurchaseApiController extends Controller
    {
        public function purchase(Request $request)
        {
            $cart = session()->get('cart', []);
    
           
            $email = auth()->user()->email;
    
            // メール送信
            Mail::to($email)->send(new OrderShipped($cart));
    
            // カートクリア
            session()->forget('cart');
    
            return response()->json([
             'message'=>'ご注文ありがとうございます！確認メールを送信しました。'
            ]);
        }
    }
    