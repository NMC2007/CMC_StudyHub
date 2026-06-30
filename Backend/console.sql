create database studyhubdb;

-- ==========================================
-- BẬT EXTENSION TÌM KIẾM KHÔNG DẤU
-- ==========================================
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ==========================================
-- 1. TẠO CÁC ENUM TYPE
-- ==========================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'LECTURER', 'STUDENT');
CREATE TYPE doc_visibility AS ENUM ('PUBLIC', 'GROUP', 'PRIVATE');

-- ==========================================
-- 2. TẠO CÁC BẢNG CẤU TRÚC HỌC THUẬT
-- ==========================================

-- Bảng Khóa học
CREATE TABLE cohorts (
                         id SERIAL PRIMARY KEY,
                         code VARCHAR(20) UNIQUE NOT NULL,
                         name VARCHAR(100) NOT NULL,
                         start_year INT NOT NULL,
                         end_year INT NOT NULL
);

-- Bảng Khoa
CREATE TABLE faculties (
                           id SERIAL PRIMARY KEY,
                           code VARCHAR(30) UNIQUE NOT NULL,
                           name VARCHAR(100) NOT NULL,
                           description TEXT
);

-- Bảng Ngành học
CREATE TABLE majors (
                        id SERIAL PRIMARY KEY,
                        code VARCHAR(30) UNIQUE NOT NULL,
                        faculty_id INT NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
                        name VARCHAR(100) NOT NULL,
                        description TEXT
);

-- Bảng Môn học
CREATE TABLE subjects (
                          id SERIAL PRIMARY KEY,
                          cohort_id INT NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
                          major_id INT NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
                          code VARCHAR(30) NOT NULL,
                          name VARCHAR(150) NOT NULL,
                          description TEXT
);

-- ==========================================
-- 3. TẠO BẢNG NGƯỜI DÙNG & AUTHENTICATION
-- ==========================================

-- Bảng Người dùng
CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       full_name VARCHAR(100) NOT NULL,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       phone VARCHAR(20) UNIQUE,
                       dob DATE,
                       password_hash VARCHAR(255) NOT NULL,
                       role user_role NOT NULL,
                       avatar VARCHAR(255),
                       cohort_id INT REFERENCES cohorts(id) ON DELETE SET NULL,
                       faculty_id INT REFERENCES faculties(id) ON DELETE SET NULL,
                       major_id INT REFERENCES majors(id) ON DELETE SET NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Refresh Tokens
CREATE TABLE refresh_tokens (
                                id SERIAL PRIMARY KEY,
                                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                token VARCHAR(500) UNIQUE NOT NULL,
                                expires_at TIMESTAMP NOT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. TẠO BẢNG TÀI LIỆU
-- ==========================================

CREATE TABLE documents (
                           id SERIAL PRIMARY KEY,
                           title VARCHAR(200) NOT NULL,
                           description TEXT,
                           cohort_id INT REFERENCES cohorts(id) ON DELETE SET NULL,
                           faculty_id INT REFERENCES faculties(id) ON DELETE SET NULL,
                           major_id INT REFERENCES majors(id) ON DELETE SET NULL,
                           subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
                           owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                           document_type VARCHAR(30),
                           visibility doc_visibility DEFAULT 'PUBLIC',
                           file_url VARCHAR(255) NOT NULL,
                           file_size INT,
                           file_type VARCHAR(50),
                           download_count INT DEFAULT 0,
                           like_count INT DEFAULT 0,
                           is_deleted BOOLEAN DEFAULT FALSE,
                           deleted_at TIMESTAMP,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. TẠO BẢNG NHÓM HỌC TẬP
-- ==========================================

-- Bảng Nhóm
CREATE TABLE groups (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(150) NOT NULL,
                        description TEXT,
                        owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Thành viên nhóm
CREATE TABLE group_members (
                               group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
                               user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (group_id, user_id)
);

-- ==========================================
-- 6. TẠO BẢNG TƯƠNG TÁC TÀI LIỆU
-- ==========================================

-- Bảng Lượt thích (Like)
CREATE TABLE document_likes (
                                id SERIAL PRIMARY KEY,
                                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                document_id INT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                UNIQUE (user_id, document_id)
);

-- Bảng Lưu tài liệu (Bookmark)
CREATE TABLE bookmarks (
                           id SERIAL PRIMARY KEY,
                           user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                           document_id INT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           UNIQUE (user_id, document_id)
);

-- Bảng Lượt xem (View)
CREATE TABLE document_views (
                                id SERIAL PRIMARY KEY,
                                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                document_id INT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ==========================================
-- SEED DATA: COHORTS
-- ==========================================

INSERT INTO cohorts (code, name, start_year, end_year)
VALUES
    ('K1', 'Khóa 1', 2021, 2025),
    ('K2', 'Khóa 2', 2022, 2026),
    ('K3', 'Khóa 3', 2023, 2027),
    ('K4', 'Khóa 4', 2025, 2029)
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- SEED DATA: FACULTIES
-- ==========================================

INSERT INTO faculties (code, name, description)
VALUES
    (
        'CNTT',
        'Công nghệ thông tin và truyền thông',
        'Đào tạo các ngành thuộc lĩnh vực Công nghệ thông tin và Truyền thông'
    )
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- SEED DATA: MAJORS
-- ==========================================

INSERT INTO majors (code, faculty_id, name, description)
VALUES
    (
        'BIT',
        (SELECT id FROM faculties WHERE code = 'CNTT'),
        'Công nghệ thông tin',
        'Bachelor of Information Technology'
    ),
    (
        'BCS',
        (SELECT id FROM faculties WHERE code = 'CNTT'),
        'Khoa học máy tính',
        'Bachelor of Computer Science'
    ),
    (
        'BAI',
        (SELECT id FROM faculties WHERE code = 'CNTT'),
        'Trí tuệ nhân tạo',
        'Bachelor of Artificial Intelligence'
    )
ON CONFLICT (code) DO NOTHING;

-- -- ==========================================
-- -- SEED DATA: ADMIN USER
-- -- ==========================================
-- -- Mật khẩu: Admin@121234 (đã hash qua bcrypt 10 salt rounds)
-- INSERT INTO users (full_name, username, email, dob, password_hash, role)
-- VALUES (
--     'Nguyễn Mạnh Cường',
--     'nmcDev',
--     'manhcuong281207@gmail.com',
--     '2007-12-28',
--     '$2b$10$tJz8p7P5Kj7t0g1O.6O/3u3Rk8K3S/3iA.s0A/3u3Rk8K3S/3iA.s',
--     'ADMIN'
-- )
-- ON CONFLICT (username) DO NOTHING;