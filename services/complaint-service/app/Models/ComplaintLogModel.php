<?php
namespace App\Models;
use CodeIgniter\Model;

class ComplaintLogModel extends Model
{
    protected $table = 'complaint_logs';
    protected $primaryKey = 'id';
    protected $allowedFields = ['complaint_id','changed_by','old_status','new_status','note'];
    protected $useTimestamps = false;
}