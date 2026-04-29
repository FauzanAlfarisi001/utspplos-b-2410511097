<?php
namespace App\Models;
use CodeIgniter\Model;

class ComplaintResponseModel extends Model
{
    protected $table = 'complaint_responses';
    protected $primaryKey = 'id';
    protected $allowedFields = ['complaint_id','responder_id','message','is_internal'];
    protected $useTimestamps = false;
}