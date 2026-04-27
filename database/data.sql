CREATE DATABASE IF NOT EXISTS db_auth;
USE db_auth;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100),
    full_name VARCHAR(200),
    avatar_url  VARCHAR(500),
    role ENUM('mahasiswa','admin','staff') NOT NULL DEFAULT 'mahasiswa',
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(200),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    is_revoked TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE token_blacklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_jti VARCHAR(200) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE DATABASE IF NOT EXISTS db_complaint;
USE db_complaint;

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('akademik','non-akademik') NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    attachment_url VARCHAR(500),
    status ENUM('submitted','in_review','in_progress','resolved','closed','rejected') NOT NULL DEFAULT 'submitted',
    priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
    is_anonymous TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE complaint_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    changed_by INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE TABLE complaint_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    responder_id INT NOT NULL,
    message TEXT NOT NULL,
    is_internal TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE DATABASE IF NOT EXISTS db_disposition;
USE db_disposition;

CREATE TABLE units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100),
    pic_user_id INT,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dispositions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    from_unit_id INT,
    to_unit_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_to INT,
    note TEXT,
    status ENUM('pending','accepted','rejected','completed') DEFAULT 'pending',
    deadline DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_unit_id) REFERENCES units(id),
    FOREIGN KEY (to_unit_id)   REFERENCES units(id)
);

CREATE TABLE disposition_followups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disposition_id  INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disposition_id) REFERENCES dispositions(id) ON DELETE CASCADE
);

CREATE DATABASE IF NOT EXISTS db_notification;
USE db_notification;

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    complaint_id    INT,
    type ENUM('status_change','new_response','disposition','rating_request','system') NOT NULL,
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    score TINYINT NOT NULL CHECK (score BETWEEN 1 AND 5),
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

USE db_auth;
INSERT INTO users (username, email, password, full_name, role, is_active) VALUES
('admin001', 'admin001@upnvj.ac.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin', 1),
('staff_akademik', 'akademik@upnvj.ac.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Staff Akademik', 'staff', 1),
('staff_kemahasiswaan', 'kemahasiswaan@upnvj.ac.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Staff Kemahasiswaan', 'staff', 1),
('mhs_joko', '2210511027@mahasiswa.upnvj.ac.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Joko Muljana', 'mahasiswa',  1),
('mhs_bowo', '23105110333@mahasiswa.upnvj.ac.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bowo', 'mahasiswa',  1),
('mhs_jack', '21105110221@mahasiswa.upnvj.ac.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jack Cho Wee', 'mahasiswa',  1);

USE db_complaint;
INSERT INTO categories (name, type, description) VALUES
('Nilai & Akademik', 'akademik', 'Pengaduan mengenai nilai, KRS, dan transkrip'),
('Fasilitas Kampus', 'non-akademik', 'Pengaduan mengenai fasilitas gedung, lab, dll'),
('Beasiswa', 'non-akademik', 'Pengaduan mengenai beasiswa dan bantuan dana'),
('Dosen & Perkuliahan', 'akademik', 'Pengaduan mengenai kehadiran dosen dan jadwal'),
('Perpustakaan', 'non-akademik', 'Pengaduan mengenai layanan perpustakaan'),
('Keamanan Kampus', 'non-akademik', 'Pengaduan mengenai keamanan dan ketertiban');

INSERT INTO complaints (ticket_number, user_id, category_id, title, description, status, priority) VALUES
('TKT-2026-001', 4, 1, 'Nilai KRS belum diupdate', 'Nilai semester lalu belum muncul di mahasiswa setelah lebih dari 1 bulan.', 'submitted', 'high'),
('TKT-2026-002', 5, 2, 'Wifi ruang 303 ngelag', 'Wifi di ruang kuliah 303 masih ngelag selama 2 minggu, perkuliahan tidak nyaman.', 'in_progress', 'medium'),
('TKT-2026-003', 6, 3, 'Beasiswa belum turun', 'Beasiswa semester ini belum turun, padahal semester lalu bulan awal langsung dapat dan langsung habis di bulan itu juga.', 'resolved', 'medium'),
('TKT-2026-004', 4, 4, 'Dosen tidak hadir', 'Dosen mata kuliah Sastra Komputer jarang hadir tanpa keterangan selama 2 minggu.', 'in_review', 'urgent'),
('TKT-2026-005', 5, 5, 'Buku tidak tersedia', 'Buku terkait mata kuliah saya tidak tersedia di perpustakaan dan tidak bisa dipinjam.', 'submitted', 'low');

USE db_disposition;
INSERT INTO units (name, code, email) VALUES
('Bagian Akademik', 'AKADEMIK', 'akademik@upnvj.ac.id'),
('Kemahasiswaan', 'KEMAHASISWAAN','kemahasiswaan@upnvj.ac.id'),
('Sarana & Prasarana', 'SARPRAS', 'sarpras@upnvj.ac.id'),
('Perpustakaan', 'PERPUS', 'perpus@upnvj.ac.id'),
('Keamanan', 'SECURITY', 'security@upnvj.ac.id');

INSERT INTO dispositions (complaint_id, to_unit_id, assigned_by, note, status, deadline) VALUES
(1, 1, 1, 'Mohon beritahu segera kabar terkait pembaruan nilai.', 'accepted',  DATE_ADD(NOW(), INTERVAL 3 DAY)),
(2, 3, 1, 'Segera cek dan perbaiki Wifi ruang 301.', 'completed', DATE_ADD(NOW(), INTERVAL 2 DAY)),
(4, 1, 1, 'Verifikasi kehadiran dosen dan ambil tindakan tepat.', 'pending', DATE_ADD(NOW(), INTERVAL 5 DAY));

USE db_notification;
INSERT INTO notifications (user_id, complaint_id, type, title, message) VALUES
(4, 1, 'status_change', 'Pengaduan Diterima', 'Pengaduan TKT-2024-001 Anda sudah diterima dan sedang diproses.'),
(5, 2, 'status_change', 'Pengaduan Diproses', 'Pengaduan TKT-2024-002 sedang dalam proses penanganan.'),
(6, 3, 'status_change', 'Pengaduan Selesai', 'Pengaduan TKT-2024-003 Anda telah selesai. Silakan beri rating.'),
(4, 4, 'disposition', 'Pengaduan Didisposisikan', 'Pengaduan TKT-2024-004 telah diteruskan ke bagian akademik.');

INSERT INTO ratings (complaint_id, user_id, score, feedback) VALUES
(3, 6, 4, 'Terima kasih, masalah beasiswa sudah diselesaikan, akan saya belikan hal yang bermanfaat.');