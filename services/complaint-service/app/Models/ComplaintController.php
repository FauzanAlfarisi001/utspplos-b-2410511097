<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;
use App\Models\ComplaintModel;
use App\Models\ComplaintLogModel;
use App\Models\ComplaintResponseModel;

class ComplaintController extends ResourceController
{
    use ResponseTrait;
    
    protected $format = 'json';
    private ComplaintModel $model;
    private ComplaintLogModel $logModel;
    private ComplaintResponseModel $responseModel;

    public function __construct()
    {
        $this->model = new ComplaintModel();
        $this-> logModel = new ComplaintLogModel();
        $this-> responseModel = new ComplaintResponseModel();
    }

    // GET /api/complaints?page=1&per_page=10&status=submitted&type=akademik mendapatkan data komplen untuk pagination 10 per halaman + filter
    public function index()
    {
        $page = (int)($this-> request-> getGet('page') ?? 1);
        $perPage = (int)($this-> request-> getGet('per_page') ?? 10);
        $perPage = min($perPage, 100);

        $filters = [
            'status' => $this-> request-> getGet('status'),
            'priority' => $this-> request-> getGet('priority'),
            'category_id' => $this->request-> getGet('category_id'),
            'user_id' => $this-> request-> getGet('user_id'),
            'type' => $this-> request-> getGet('type'),
            'search' => $this-> request-> getGet('search'),
        ];

        $result = $this-> model-> listWithFilters($filters, $page, $perPage);

        return $this-> respond([
            'statusCode' => 200,
            'message' => 'OK',
            'meta' =>['page' => $page,'per_page' => $perPage, 'total' => $result['total'], 'total_pages' => (int)ceil($result['total'] / $perPage),],
            'data' =>$result['data'],
        ]);
    }

    /* GET /api/complaints/:id mendapatkan komplen data lebih lengkap */
    public function show($id = null)
    {
        $complaint = $this-> model-> getWithCategory((int)$id);
        if (!$complaint) 
            return $this-> failNotFound('Pengaduan tidak ada.');

        return $this->respond(['statusCode' => 200, 'data' => $complaint]);
    }

    // Internal GET mendapatkan komplen secara internal/langsung
    public function internalShow($id = null)
    {
        $complaint = $this-> model-> find((int)$id);
        if (!$complaint) 
            return $this-> failNotFound('Pengaduan tidak ada.');
        
        return $this-> respond(['statusCode' => 200, 'data' => $complaint]);
    }

    // POST /api/complaints buat komplen
    public function create()
    {
        $data = $this-> request-> getJSON(true);
        $rules = [
            'user_id' => 'required|integer',
            'category_id' => 'required|integer',
            'title' => 'required|min_length[10]|max_length[300]',
            'description' => 'required|min_length[20]',
            'priority' => 'in_list[low,medium,high,urgent]',
        ];
        if (!$this-> validateData($data ?? [], $rules)) {
            return $this->failValidationErrors($this-> validator-> getErrors());
        }

        $ticketNumber = 'TKT-' . date('Y') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);

        $id = $this-> model-> insert([
            'ticket_number' => $ticketNumber,
            'user_id' => $data['user_id'],
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'priority' => $data['priority'] ?? 'medium',
            'is_anonymous' => $data['is_anonymous'] ?? 0,
        ]);

        return $this-> respondCreated([
            'statusCode' => 201,
            'message' =>'Pengaduan berhasil dibuat.',
            'ticket_number' => $ticketNumber,
            'id' =>$id,
        ]);
    }

    // PUT /api/complaints/:id/status update status
    public function updateStatus($id = null)
    {
        $complaint = $this-> model-> find((int)$id);
        if (!$complaint) 
            return $this-> failNotFound('Pengaduan tidak ada.');

        $data = $this-> request->getJSON(true);
        $rules = [
            'status' =>'required|in_list[submitted,in_review,in_progress,resolved,closed,rejected]',
            'changed_by' =>'required|integer',
        ];
        if (!$this-> validateData($data ?? [], $rules))
            return $this-> failValidationErrors($this-> validator-> getErrors());

        $oldStatus = $complaint['status'];
        $this-> model-> update($id, ['status' => $data['status']]);

        $this-> logModel-> insert([
            'complaint_id' =>$id,
            'changed_by' =>$data['changed_by'],
            'old_status' => $oldStatus,
            'new_status' => $data['status'],
            'note' => $data['note'] ?? null,
        ]);

        return $this-> respond(['statusCode' => 200, 'message' => 'Status sudah diupdate.']);
    }

    // PUT /api/complaints/:id  update komplen
    public function update($id = null)
    {
        $complaint = $this-> model->find((int)$id);
        if (!$complaint) 
            return $this-> failNotFound('Pengaduan tidak ada.');

        $data = $this-> request-> getJSON(true);
        $this-> model-> update($id, array_filter([
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'priority' => $data['priority']    ?? null,
        ]));

        return $this-> respond(['statusCode' => 200, 'message' => 'Pengaduan sudah diupdate.']);
    }

    // DELETE /api/complaints/:id  hapus komplen
    public function delete($id = null)
    {
        $complaint = $this-> model->find((int)$id);
        if (!$complaint) 
            return $this-> failNotFound('Pengaduan tidak ada.');
        $this-> model-> delete($id);
        return $this-> respondDeleted(['statusCode' => 200, 'message' => 'Pengaduan dihapus.']);
    }

    // GET /api/complaints/:id/responses  mendapatkan res
    public function responses($id = null)
    {
        $responses = $this-> responseModel
            ->where('complaint_id', $id)
            ->where('is_internal', 0)
            ->orderBy('created_at', 'ASC')
            ->findAll();
        return $this->respond(['statusCode' => 200, 'data' => $responses]);
    }

    // POST /api/complaints/:id/responses menambahkan res
    public function addResponse($id = null)
    {
        $data = $this->request-> getJSON(true);
        $rules = [
            'responder_id' => 'required|integer',
            'message' => 'required|min_length[5]',
        ];
        if (!$this-> validateData($data ?? [], $rules))
            return $this-> failValidationErrors($this-> validator-> getErrors());

        $this-> responseModel-> insert([
            'complaint_id' => $id,
            'responder_id'=> $data['responder_id'],
            'message'=>$data['message'],
            'is_internal'=>$data['is_internal'] ?? 0,
        ]);

        return $this-> respondCreated(['statusCode'=>201,'message'=>'Respons sudah ditambahkan.']);
    }
}