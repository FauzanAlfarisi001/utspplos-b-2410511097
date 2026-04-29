<?php
namespace App\Filters;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class JwtFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer '))
            return service('response')-> setStatusCode(401)->setJSON(['message' => 'Token tidak ada.']);

        $token = substr($authHeader, 7);
        $authUrl = env('AUTH_SERVICE_URL', 'http://localhost:3001');

        $ch = curl_init("$authUrl/api/auth/verify");
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ["Authorization: Bearer $token"],]);
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code !== 200)
            return service('response')-> setStatusCode(401)-> setJSON(['message' => 'Token tidak sesuai.']);

        $decoded = json_decode($body, true);

        $_SERVER['X_AUTH_USER_ID']   = $decoded['user']['id'] ?? null;
        $_SERVER['X_AUTH_USER_ROLE'] = $decoded['user']['role'] ?? null;
    }
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}