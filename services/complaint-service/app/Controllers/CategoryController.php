<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;
use App\Models\CategoryModel;

class CategoryController extends ResourceController
{
    use ResponseTrait;
    protected $format = 'json';
    private CategoryModel $catModel;

    public function __construct() 
    { 
        $this-> catModel =new CategoryModel(); 
    }

    public function index()
    {
        $type = $this->request->getGet('type');
        $q = $this->catModel->where('is_active', 1);
        if ($type) $q->where('type', $type);
        
        return $this -> respond(['statusCode'=> 200, 'data' => $q-> findAll()]);
    }

    public function create()
    {
        $data = $this-> request-> getJSON(true);
        $rules = ['name'=> 'required', 'type' => 'required|in_list[akademik,non-akademik]'];

        if (!$this->validateData($data ?? [], $rules))
            return $this-> failValidationErrors($this-> validator-> getErrors());

        $id = $this-> catModel-> insert($data);

        return $this->respondCreated(['statusCode' => 201, 'id' => $id]);
    }
}