<?php
namespace App\Models;
use CodeIgniter\Model;

class CategoryModel extends Model
{
    protected $table = 'categories';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name','type','description','is_active'];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = null;
    
}