<?php
namespace App\Models;
use CodeIgniter\Model;

class ComplaintModel extends Model
{
    protected $table = 'complaints';
    protected $primaryKey = 'id';
    protected $allowedFields = ['ticket_number','user_id','category_id','title', 'description','attachment_url','status','priority','is_anonymous'];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    public function getWithCategory(int $id)
    {
        return $this-> db-> table('complaints c')
            ->join('categories cat', 'c.category_id = cat.id')
            ->select('c.*, cat.name as category_name, cat.type as category_type')
            ->where('c.id', $id)
            ->get()-> getRowArray();
    }

    public function listWithFilters(array $filters, int $page, int $perPage): array
    {
        $builder = $this-> db-> table('complaints c')
            ->join('categories cat', 'c.category_id = cat.id')
            ->select('c.*, cat.name as category_name, cat.type as category_type')
            ->orderBy('c.created_at', 'DESC');

        if (!empty($filters['status'])) 
            $builder-> where('c.status', $filters['status']);

        if (!empty($filters['priority'])) 
            $builder-> where('c.priority', $filters['priority']);

        if (!empty($filters['category_id'])) 
            $builder-> where('c.category_id', $filters['category_id']);

        if (!empty($filters['user_id'])) 
            $builder-> where('c.user_id', $filters['user_id']);

        if (!empty($filters['type'])) 
            $builder-> where('cat.type', $filters['type']);

        if (!empty($filters['search']))
            $builder-> like('c.title', $filters['search']);

        $total = $builder-> countAllResults(false);
        $data = $builder-> limit($perPage, ($page - 1)* $perPage)->get()->getResultArray();
        return ['data'=> $data, 'total'=> $total];
    }
}