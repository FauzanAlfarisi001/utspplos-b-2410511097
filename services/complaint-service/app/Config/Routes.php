<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

$routes->group('api', function($routes) {
    $routes->get('categories', 'CategoryController::index');
    $routes->post('categories', 'CategoryController::create');

    // internal
    $routes->get('complaints/internal/(:num)', 'ComplaintController::internalShow/$1');
    
    $routes->get('complaints', 'ComplaintController::index');
    $routes->post('complaints', 'ComplaintController::create');
    $routes->get('complaints/(:num)', 'ComplaintController::show/$1');
    $routes->put('complaints/(:num)', 'ComplaintController::update/$1');
    $routes->delete('complaints/(:num)', 'ComplaintController::delete/$1');

    $routes->put('complaints/(:num)/status', 'ComplaintController::updateStatus/$1');
    $routes->get('complaints/(:num)/responses','ComplaintController::responses/$1');
    $routes->post('complaints/(:num)/responses','ComplaintController::addResponse/$1');
});
