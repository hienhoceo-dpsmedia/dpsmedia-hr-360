-- Create new table for Year-End Assessments
-- This table stores "Most Favorite" and "Most Influential" votes
CREATE TABLE IF NOT EXISTS public.hr_year_end_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- Name to join with hr_staff_info
    most_favorite INT DEFAULT 0,
    most_influential INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hr_year_end_assessment ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone
CREATE POLICY "Allow read access for all users" ON public.hr_year_end_assessment
FOR SELECT USING (true);

-- Insert Data (Upsert based on name if possible, but here we just insert)
-- Using ON CONFLICT (name) requires a unique constraint, let's just truncate and insert for simplicity in this script
TRUNCATE TABLE public.hr_year_end_assessment;

INSERT INTO public.hr_year_end_assessment (name, most_favorite, most_influential) VALUES
('Lê Thị Hằng', 15, 19),
('Hồ Quang Hiển', 5, 19),
('Nguyễn Thị Minh Bảo', 7, 15),
('Phan Thị Như Hảo', 14, 4),
('Phạm Hoàng Bảo Nhi', 6, 3),
('Đỗ Minh Nhựt', 4, 4),
('Lê Thị Thu Trúc', 6, 2),
('Phan Thị Mỹ Huyền', 6, 0),
('Bùi Thị Hà Trang', 5, 1),
('Hồ Thị Ánh Tuyết', 0, 3),
('Phi Oanh Oanh', 2, 1),
('Nguyễn Hữu Khánh', 2, 0),
('Nguyễn Bảo Kim Hoàng', 1, 0);
