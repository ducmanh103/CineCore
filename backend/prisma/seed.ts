import { PrismaClient, RoleName, UserStatus, MovieStatus, SeatType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

// Helper PII Encryption (AES-256-GCM + HMAC-SHA256 Blind Index)
const DEFAULT_KEY_HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const DEFAULT_SALT = 'cinemahub_pii_blind_index_salt_secure_2026';

function encryptPii(plainText: string): string {
  const keyHex = process.env.PII_ENCRYPTION_KEY || DEFAULT_KEY_HEX;
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `ENC:v1:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function computeEmailHash(email: string): string {
  const salt = process.env.PII_BLIND_INDEX_SALT || DEFAULT_SALT;
  const normalized = email.trim().toLowerCase();
  return crypto.createHmac('sha256', salt).update(normalized).digest('hex');
}

async function main() {
  console.log('🌱 Bắt đầu gieo mầm dữ liệu chuẩn CineCore từ CinemaManagement_PostgreSQL.sql...');

  // 1. Roles
  console.log('👉 Tạo 3 vai trò hệ thống (ADMIN, STAFF, CUSTOMER)...');
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: RoleName.ADMIN },
      update: {},
      create: { name: RoleName.ADMIN, description: 'Quản trị viên toàn quyền hệ thống' },
    }),
    prisma.role.upsert({
      where: { name: RoleName.STAFF },
      update: {},
      create: { name: RoleName.STAFF, description: 'Nhân viên quản lý rạp và bán vé' },
    }),
    prisma.role.upsert({
      where: { name: RoleName.CUSTOMER },
      update: {},
      create: { name: RoleName.CUSTOMER, description: 'Khách hàng thành viên xem phim' },
    }),
  ]);

  const adminRole = roles.find((r) => r.name === RoleName.ADMIN)!;
  const staffRole = roles.find((r) => r.name === RoleName.STAFF)!;
  const customerRole = roles.find((r) => r.name === RoleName.CUSTOMER)!;

  // 2. Users mẫu (Mật khẩu được băm BCrypt + PII mã hóa AES-256-GCM)
  console.log('👉 Tạo 3 tài khoản mẫu (admin, staff1, customer1)...');
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const staffPasswordHash = await bcrypt.hash('Staff@123456', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123456', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      fullName: encryptPii('Nguyễn Đức Mạnh'),
      email: encryptPii('necma2005@gmail.com'),
      emailHash: computeEmailHash('necma2005@gmail.com'),
      phone: '0901000001',
      status: UserStatus.ACTIVE,
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'staff1' },
    update: {},
    create: {
      username: 'staff1',
      passwordHash: staffPasswordHash,
      fullName: encryptPii('Trần Văn Nhân Viên'),
      email: encryptPii('staff1@cinecore.vn'),
      emailHash: computeEmailHash('staff1@cinecore.vn'),
      phone: '0901000002',
      status: UserStatus.ACTIVE,
      roleId: staffRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'customer1' },
    update: {},
    create: {
      username: 'customer1',
      passwordHash: customerPasswordHash,
      fullName: encryptPii('Nguyễn Văn Khách Hàng'),
      email: encryptPii('customer1@gmail.com'),
      emailHash: computeEmailHash('customer1@gmail.com'),
      phone: '0901000003',
      status: UserStatus.ACTIVE,
      roleId: customerRole.id,
    },
  });

  // 3. Thể loại phim (Genres) theo CinemaManagement_PostgreSQL.sql
  console.log('👉 Tạo 6 thể loại phim chuẩn...');
  const genresData = [
    { name: 'Hành động', slug: 'hanh-dong' },
    { name: 'Hài hước', slug: 'hai-huoc' },
    { name: 'Tâm lý', slug: 'tam-ly' },
    { name: 'Kinh dị', slug: 'kinh-di' },
    { name: 'Khoa học viễn tưởng', slug: 'khoa-hoc-vien-tuong' },
    { name: 'Hoạt hình', slug: 'hoat-hinh' },
  ];

  const genres = await Promise.all(
    genresData.map((g) =>
      prisma.genre.upsert({
        where: { slug: g.slug },
        update: {},
        create: g,
      }),
    ),
  );

  const genreMap = new Map(genres.map((g) => [g.slug, g.id]));

  // 4. 19 Bộ phim chiếu rạp theo CinemaManagement_PostgreSQL.sql
  console.log('👉 Tạo 19 bộ phim chiếu rạp đầy đủ...');
  const moviesData = [
    {
      title: 'Kung Fu Panda 4',
      slug: 'kung-fu-panda-4',
      description: 'Sau khi được chọn làm Thủ Lĩnh Tinh Thần của Thung Lũng Bình Yên, Po cần tìm và huấn luyện một chiến binh Rồng mới, trong khi một kẻ thù độc ác mới là Tắc Kè Bông Chameleon đang nhăm nhe triệu hồi tất cả những kẻ phản diện từ quá khứ.',
      duration: 94,
      releaseDate: new Date('2024-03-08'),
      ageRating: 'P',
      director: 'Mike Mitchell',
      cast: 'Jack Black, Awkwafina, Viola Davis',
      posterUrl: '/img/movies/kungfupanda4.jpg',
      bannerUrl: '/img/movies/kungfupanda4-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/_inKs4eeHiI',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hoat-hinh', 'hai-huoc'],
    },
    {
      title: 'Dune: Phần 2',
      slug: 'dune-phan-2',
      description: 'Paul Atreides hội ngộ cùng Chani và người Fremen khi anh tìm cách trả thù những kẻ đã hủy diệt gia đình mình. Đối mặt với sự lựa chọn giữa tình yêu của đời mình và số phận của vũ trụ, Paul cố gắng ngăn chặn một tương lai khủng khiếp mà chỉ anh mới có thể thấy trước.',
      duration: 166,
      releaseDate: new Date('2024-03-01'),
      ageRating: 'T16',
      director: 'Denis Villeneuve',
      cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson',
      posterUrl: '/img/movies/dune2.jpg',
      bannerUrl: '/img/movies/dune2-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['khoa-hoc-vien-tuong', 'hanh-dong'],
    },
    {
      title: 'Mai',
      slug: 'mai',
      description: 'Mai là câu chuyện tình cảm nhẹ nhàng nhưng chứa đựng nhiều góc khuất tâm lý sâu sắc xoay quanh cuộc đời của một người phụ nữ tên Mai, người luôn nỗ lực vượt lên số phận và định kiến xã hội để tìm kiếm hạnh phúc đích thực.',
      duration: 131,
      releaseDate: new Date('2024-02-10'),
      ageRating: 'T18',
      director: 'Trấn Thành',
      cast: 'Phương Anh Đào, Tuấn Trần, Trấn Thành',
      posterUrl: '/img/movies/mai.jpg',
      bannerUrl: '/img/movies/mai-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/W8VekFsJKZc',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['tam-ly'],
    },
    {
      title: 'Quật Mộ Trùng Ma',
      slug: 'quat-mo-trung-ma',
      description: 'Hai pháp sư, một thầy phong thủy và một người chôn cất cùng nhau hợp tác để khai quật một ngôi mộ bí ẩn của một gia đình giàu có ở Mỹ, vô tình giải phóng một thế lực tà ác đáng sợ ẩn giấu bên dưới.',
      duration: 134,
      releaseDate: new Date('2024-03-15'),
      ageRating: 'T18',
      director: 'Jang Jae-hyun',
      cast: 'Choi Min-sik, Kim Go-eun, Lee Do-hyun',
      posterUrl: '/img/movies/quatmotrungma.jpg',
      bannerUrl: '/img/movies/quatmotrungma-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/ag5d9Su53nA',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['kinh-di'],
    },
    {
      title: 'Godzilla x Kong',
      slug: 'godzilla-x-kong',
      description: 'Godzilla và Kong phải gạt bỏ những bất hòa xưa cũ để cùng nhau hợp tác chống lại một mối đe dọa khổng lồ mới từ bên trong Trái Đất Rỗng, đe dọa sự tồn vong của cả hai loài và toàn nhân loại.',
      duration: 115,
      releaseDate: new Date('2026-11-20'),
      ageRating: 'T13',
      director: 'Adam Wingard',
      cast: 'Rebecca Hall, Brian Tyree Henry, Dan Stevens',
      posterUrl: '/img/movies/godzillaxkong.jpg',
      bannerUrl: '/img/movies/godzillaxkong-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/lV1OOlGwExM',
      status: MovieStatus.COMING_SOON,
      genreSlugs: ['hanh-dong', 'khoa-hoc-vien-tuong'],
    },
    {
      title: 'Avatar',
      slug: 'avatar',
      description: 'Một cựu thủy quân lục chiến bị liệt được phái đến hành tinh Pandora để thực hiện một nhiệm vụ đặc biệt, nhưng anh đã yêu một cô gái bản địa người Na\'vi và phải chiến đấu để bảo vệ hành tinh quê hương của cô.',
      duration: 162,
      releaseDate: new Date('2009-12-18'),
      ageRating: 'T13',
      director: 'James Cameron',
      cast: 'Sam Worthington, Zoe Saldana, Sigourney Weaver',
      posterUrl: '/img/movies/avatar.jpg',
      bannerUrl: '/img/movies/avatar-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hanh-dong', 'khoa-hoc-vien-tuong'],
    },
    {
      title: 'Deadpool 2',
      slug: 'deadpool-2',
      description: 'Deadpool phải thành lập một nhóm dị nhân mang tên X-Force để bảo vệ một cậu bé dị nhân trẻ tuổi khỏi Cable, một người lính đi xuyên thời gian.',
      duration: 119,
      releaseDate: new Date('2018-05-18'),
      ageRating: 'T18',
      director: 'David Leitch',
      cast: 'Ryan Reynolds, Josh Brolin, Morena Baccarin',
      posterUrl: '/img/movies/deadpool2.jpg',
      bannerUrl: '/img/movies/deadpool2-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/73_1biulkYk',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hanh-dong', 'hai-huoc'],
    },
    {
      title: 'Fast & Furious 10',
      slug: 'fast-and-furious-10',
      description: 'Dom Toretto và gia đình của mình phải đối mặt với đối thủ nguy hiểm nhất từ trước đến nay: một kẻ thù đầy thù hận từ quá khứ muốn phá hủy tất cả những gì Dom yêu quý.',
      duration: 141,
      releaseDate: new Date('2023-05-19'),
      ageRating: 'T16',
      director: 'Louis Leterrier',
      cast: 'Vin Diesel, Michelle Rodriguez, Jason Momoa',
      posterUrl: '/img/movies/fastx.jpg',
      bannerUrl: '/img/movies/fastx-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/32RAq6JzguY',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hanh-dong'],
    },
    {
      title: 'Biệt Đội Săn Ma: Kỷ Nguyên Băng Giá',
      slug: 'biet-doi-san-ma-ky-nguyen-bang-gia',
      description: 'Gia đình Spengler quay trở lại nơi mọi thứ bắt đầu - trạm cứu hỏa thành phố New York mang tính biểu tượng - để lập nhóm với các Ghostbusters ban đầu, những người đã phát triển một phòng thí nghiệm nghiên cứu tối mật.',
      duration: 115,
      releaseDate: new Date('2024-03-22'),
      ageRating: 'P',
      director: 'Gil Kenan',
      cast: 'Paul Rudd, Carrie Coon, Finn Wolfhard',
      posterUrl: '/img/movies/ghostbusters.jpg',
      bannerUrl: '/img/movies/ghostbusters-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/AbkYj4X_9g4',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hanh-dong', 'hai-huoc', 'khoa-hoc-vien-tuong'],
    },
    {
      title: 'Võ Sĩ Giác Đấu 2',
      slug: 'vo-si-giac-dau-2',
      description: 'Nhiều năm sau khi chứng kiến cái chết của Maximus dưới tay người chú của mình, Lucius buộc phải bước vào Đấu trường La Mã sau khi quê hương anh bị chinh phục bởi những vị hoàng đế tàn bạo.',
      duration: 148,
      releaseDate: new Date('2024-11-22'),
      ageRating: 'T18',
      director: 'Ridley Scott',
      cast: 'Paul Mescal, Pedro Pascal, Denzel Washington',
      posterUrl: '/img/movies/gladiator2.jpg',
      bannerUrl: '/img/movies/gladiator2-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hanh-dong', 'tam-ly'],
    },
    {
      title: 'Sát Thủ John Wick: Phần 4',
      slug: 'sat-thu-john-wick-phan-4',
      description: 'John Wick tìm ra con đường đánh bại High Table. Nhưng trước khi có thể kiếm được tự do, Wick phải đối mặt với một kẻ thù mới có liên minh hùng mạnh trên toàn cầu và những thế lực biến bạn cũ thành kẻ thù.',
      duration: 169,
      releaseDate: new Date('2023-03-24'),
      ageRating: 'T18',
      director: 'Chad Stahelski',
      cast: 'Keanu Reeves, Donnie Yen, Bill Skarsgård',
      posterUrl: '/img/movies/johnwick4.jpg',
      bannerUrl: '/img/movies/johnwick4-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/qEVUtrk8_B4',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hanh-dong'],
    },
    {
      title: 'Mufasa: Vua Sư Tử',
      slug: 'mufasa-vua-su-tu',
      description: 'Rafiki kể câu chuyện về huyền thoại Mufasa cho cô sư tử con Kiara, con gái của Simba và Nala, với Timon và Pumbaa đóng vai trò kể chuyện hài hước.',
      duration: 120,
      releaseDate: new Date('2024-12-20'),
      ageRating: 'P',
      director: 'Barry Jenkins',
      cast: 'Aaron Pierre, Kelvin Harrison Jr., Seth Rogen',
      posterUrl: '/img/movies/mufasa.jpg',
      bannerUrl: '/img/movies/mufasa-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/o17MF9vnabg',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hanh-dong', 'tam-ly', 'hoat-hinh'],
    },
    {
      title: 'Vùng Đất Câm Lặng: Ngày Một',
      slug: 'vung-dat-cam-lang-ngay-mot',
      description: 'Trải nghiệm ngày thế giới rơi vào tĩnh lặng trong phần tiền truyện này của loạt phim kinh dị sinh tồn ăn khách.',
      duration: 100,
      releaseDate: new Date('2024-06-28'),
      ageRating: 'T16',
      director: 'Michael Sarnoski',
      cast: 'Lupita Nyong\'o, Joseph Quinn, Alex Wolff',
      posterUrl: '/img/movies/quietplace.jpg',
      bannerUrl: '/img/movies/quietplace-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/YPY7J-flzE8',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['kinh-di', 'khoa-hoc-vien-tuong'],
    },
    {
      title: 'Sonic the Hedgehog 3',
      slug: 'sonic-the-hedgehog-3',
      description: 'Sonic, Knuckles và Tails tái hợp chống lại một đối thủ mới mạnh mẽ, Shadow, kẻ thù bí ẩn với sức mạnh vượt trội.',
      duration: 110,
      releaseDate: new Date('2024-12-20'),
      ageRating: 'P',
      director: 'Jeff Fowler',
      cast: 'Ben Schwartz, Jim Carrey, Keanu Reeves',
      posterUrl: '/img/movies/sonic3.jpg',
      bannerUrl: '/img/movies/sonic3-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/qSu6i2iFMO0',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hanh-dong', 'hoat-hinh'],
    },
    {
      title: 'Người Nhện: Du Hành Vũ Trụ Nhện',
      slug: 'nguoi-nhen-du-hanh-vu-tru-nhen',
      description: 'Miles Morales tái hợp với Gwen Stacy để thực hiện một cuộc phiêu lưu xuyên qua Đa vũ trụ, nơi anh gặp một nhóm Người Nhện chịu trách nhiệm bảo vệ sự tồn tại của nó.',
      duration: 140,
      releaseDate: new Date('2023-06-02'),
      ageRating: 'P',
      director: 'Joaquim Dos Santos, Kemp Powers',
      cast: 'Shameik Moore, Hailee Steinfeld, Oscar Isaac',
      posterUrl: '/img/movies/spiderman.jpg',
      bannerUrl: '/img/movies/spiderman-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/shW9i6k8cB0',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hanh-dong', 'hoat-hinh', 'khoa-hoc-vien-tuong'],
    },
    {
      title: 'Titanic',
      slug: 'titanic',
      description: 'Câu chuyện tình yêu đầy bi kịch giữa chàng họa sĩ nghèo Jack Dawson và tiểu thư quý tộc Rose DeWitt Bukater trên con tàu Titanic định mệnh.',
      duration: 194,
      releaseDate: new Date('1997-12-19'),
      ageRating: 'T16',
      director: 'James Cameron',
      cast: 'Leonardo DiCaprio, Kate Winslet, Billy Zane',
      posterUrl: '/img/movies/titanic.jpg',
      bannerUrl: '/img/movies/titanic-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/I10q6fj4n3U',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['tam-ly'],
    },
    {
      title: 'Chiến Binh Báo Đen: Wakanda Bất Diệt',
      slug: 'chien-binh-bao-den-wakanda-bat-diet',
      description: 'Nữ hoàng Ramonda, Shuri, M\'Baku, Okoye và Dora Milaje chiến đấu để bảo vệ quốc gia của họ khỏi sự can thiệp của các cường quốc thế giới sau cái chết của Vua T\'Challa.',
      duration: 161,
      releaseDate: new Date('2022-11-11'),
      ageRating: 'T13',
      director: 'Ryan Coogler',
      cast: 'Letitia Wright, Lupita Nyong\'o, Danai Gurira',
      posterUrl: '/img/movies/wakanda.jpg',
      bannerUrl: '/img/movies/wakanda-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/_Z3QKkl1WyM',
      status: MovieStatus.NOW_SHOWING,
      genreSlugs: ['hanh-dong', 'khoa-hoc-vien-tuong'],
    },
    {
      title: 'Avatar 3: Lửa và Tro Tàn',
      slug: 'avatar-3-lua-va-tro-tan',
      description: 'Jake Sully và gia đình Na\'vi tiếp tục cuộc chiến bảo vệ Pandora trước một bộ tộc Na\'vi hung hãn mới xuất hiện.',
      duration: 190,
      releaseDate: new Date('2026-10-16'),
      ageRating: 'T13',
      director: 'James Cameron',
      cast: 'Sam Worthington, Zoe Saldana, Michelle Yeoh',
      posterUrl: '/img/movies/avatar3.jpg',
      bannerUrl: '/img/movies/avatar-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/a8Gx8wiNbs8',
      status: MovieStatus.COMING_SOON,
      genreSlugs: ['hanh-dong', 'khoa-hoc-vien-tuong'],
    },
    {
      title: 'Zootopia 2',
      slug: 'zootopia-2',
      description: 'Judy Hopps và Nick Wilde trở lại điều tra một vụ án mới, dẫn họ khám phá những ngóc ngách chưa từng biết đến của thành phố Zootopia.',
      duration: 108,
      releaseDate: new Date('2026-12-04'),
      ageRating: 'P',
      director: 'Jared Bush, Byron Howard',
      cast: 'Ginnifer Goodwin, Jason Bateman, Ke Huy Quan',
      posterUrl: '/img/movies/zootopia2.jpg',
      bannerUrl: '/img/movies/kungfupanda4-banner.jpg',
      trailerUrl: 'https://www.youtube.com/embed/jWM0ct-OLsM',
      status: MovieStatus.COMING_SOON,
      genreSlugs: ['hai-huoc', 'hoat-hinh'],
    },
  ];

  const createdMovies = [];
  for (const m of moviesData) {
    const { genreSlugs, ...movieData } = m;
    const movie = await prisma.movie.upsert({
      where: { slug: movieData.slug },
      update: {},
      create: movieData,
    });

    for (const gSlug of genreSlugs) {
      const gId = genreMap.get(gSlug);
      if (gId) {
        await prisma.movieGenre.upsert({
          where: { movieId_genreId: { movieId: movie.id, genreId: gId } },
          update: {},
          create: { movieId: movie.id, genreId: gId },
        });
      }
    }
    createdMovies.push(movie);
  }

  // 5. 5 Cụm rạp theo CinemaManagement_PostgreSQL.sql
  console.log('👉 Tạo 5 cụm rạp và 25 phòng chiếu...');
  const theatersData = [
    {
      name: 'CineCore Nguyễn Huệ',
      slug: 'cinecore-nguyen-hue',
      address: '123 Nguyễn Huệ, Quận 1',
      city: 'TP. Hồ Chí Minh',
      phone: '028 3822 1234',
      rooms: [
        { name: 'Phòng 1 (Standard)', screenType: '2D Digital', seatCount: 30 },
        { name: 'Phòng 2 (VIP)', screenType: 'Gold Class 3D', seatCount: 20 },
      ],
    },
    {
      name: 'CineCore Hà Đông',
      slug: 'cinecore-ha-dong',
      address: '110 Trần Phú, Hà Đông',
      city: 'Hà Nội',
      phone: '024 3355 6789',
      rooms: [
        { name: 'Phòng 1 (IMAX)', screenType: 'IMAX Laser 4K', seatCount: 40 },
        { name: 'Phòng 2', screenType: '2D Digital', seatCount: 40 },
        { name: 'Phòng 3', screenType: '2D Digital', seatCount: 30 },
        { name: 'Phòng 4', screenType: '3D Digital', seatCount: 30 },
        { name: 'Phòng 5 (Super)', screenType: '4DX Laser', seatCount: 50 },
      ],
    },
    {
      name: 'CineCore Đà Nẵng',
      slug: 'cinecore-da-nang',
      address: '910A Ngô Quyền, Sơn Trà',
      city: 'Đà Nẵng',
      phone: '0236 3999 888',
      rooms: [
        { name: 'Phòng 1 (Grand)', screenType: 'IMAX Laser', seatCount: 50 },
        { name: 'Phòng 2', screenType: '2D Digital', seatCount: 40 },
        { name: 'Phòng 3', screenType: '3D Digital', seatCount: 40 },
        { name: 'Phòng 4', screenType: '2D Digital', seatCount: 30 },
        { name: 'Phòng 5', screenType: '2D Digital', seatCount: 30 },
        { name: 'Phòng 6', screenType: 'Gold Class', seatCount: 30 },
      ],
    },
    {
      name: 'CineCore Cần Thơ',
      slug: 'cinecore-can-tho',
      address: 'Đại lộ Hoà Bình, Ninh Kiều',
      city: 'Cần Thơ',
      phone: '0292 3888 777',
      rooms: [
        { name: 'Phòng 1', screenType: '2D Digital', seatCount: 40 },
        { name: 'Phòng 2', screenType: '3D Digital', seatCount: 40 },
        { name: 'Phòng 3', screenType: '2D Digital', seatCount: 30 },
        { name: 'Phòng 4', screenType: '2D Digital', seatCount: 30 },
        { name: 'Phòng 5 (VIP)', screenType: 'VIP Lounge', seatCount: 20 },
      ],
    },
    {
      name: 'CineCore Huế',
      slug: 'cinecore-hue',
      address: 'Vincom Plaza, Phú Nhuận',
      city: 'Huế',
      phone: '0234 3777 666',
      rooms: [
        { name: 'Phòng 1 (Premiere)', screenType: 'IMAX Laser 4K', seatCount: 50 },
        { name: 'Phòng 2', screenType: '2D Digital', seatCount: 40 },
        { name: 'Phòng 3', screenType: '2D Digital', seatCount: 40 },
        { name: 'Phòng 4', screenType: '3D Digital', seatCount: 30 },
        { name: 'Phòng 5', screenType: '2D Digital', seatCount: 30 },
        { name: 'Phòng 6', screenType: '2D Digital', seatCount: 30 },
        { name: 'Phòng 7 (VIP)', screenType: 'Gold Class', seatCount: 20 },
      ],
    },
  ];

  const createdRooms = [];

  for (const t of theatersData) {
    const { rooms: tRooms, ...theaterData } = t;
    const theater = await prisma.theater.upsert({
      where: { slug: theaterData.slug },
      update: {},
      create: theaterData,
    });

    for (const r of tRooms) {
      let room = await prisma.room.findFirst({
        where: { theaterId: theater.id, name: r.name },
      });

      if (!room) {
        room = await prisma.room.create({
          data: {
            theaterId: theater.id,
            name: r.name,
            screenType: r.screenType,
            totalSeats: r.seatCount,
          },
        });

        // Tạo ma trận ghế chuẩn PL/pgSQL từ CinemaManagement_PostgreSQL.sql
        // s_count: 50 -> rows A..E, 10 cols
        //          40 -> rows A..E, 8 cols
        //          30 -> rows A..E, 6 cols
        //          20 -> rows A..D, 5 cols
        let maxRowChar = 'E';
        let maxCols = 8;
        if (r.seatCount === 50) {
          maxRowChar = 'E';
          maxCols = 10;
        } else if (r.seatCount === 40) {
          maxRowChar = 'E';
          maxCols = 8;
        } else if (r.seatCount === 30) {
          maxRowChar = 'E';
          maxCols = 6;
        } else {
          maxRowChar = 'D';
          maxCols = 5;
        }

        const maxRowCode = maxRowChar.charCodeAt(0);
        const seatsToCreate = [];

        for (let rCode = 'A'.charCodeAt(0); rCode <= maxRowCode; rCode++) {
          const rowChar = String.fromCharCode(rCode);
          const isVip = rCode >= maxRowCode - 1; // 2 hàng cuối là VIP

          for (let col = 1; col <= maxCols; col++) {
            seatsToCreate.push({
              roomId: room.id,
              seatRow: rowChar,
              seatNumber: col,
              seatType: isVip ? SeatType.VIP : SeatType.STANDARD,
            });
          }
        }
        await prisma.seat.createMany({ data: seatsToCreate });
      }
      createdRooms.push(room);
    }
  }

  // 6. Lịch chiếu mẫu (Showtimes) theo CinemaManagement_PostgreSQL.sql
  console.log('👉 Tạo các suất chiếu tự động từ hôm nay đến các tuần tới...');
  const nowShowingMovies = createdMovies.filter((m) => m.status === MovieStatus.NOW_SHOWING);

  const slotConfigs = [
    { h: 9, mn: 0, price: 75000 },
    { h: 11, mn: 30, price: 85000 },
    { h: 14, mn: 0, price: 90000 },
    { h: 16, mn: 30, price: 95000 },
    { h: 19, mn: 0, price: 110000 },
    { h: 21, mn: 30, price: 105000 },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let showtimeCount = 0;
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const d = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);

    for (let rIdx = 0; rIdx < Math.min(createdRooms.length, 12); rIdx++) {
      const room = createdRooms[rIdx];

      for (let sIdx = 0; sIdx < slotConfigs.length; sIdx++) {
        const slot = slotConfigs[sIdx];
        const movieIdx = (rIdx + dayOffset + sIdx) % nowShowingMovies.length;
        const movie = nowShowingMovies[movieIdx];

        const startTime = new Date(d);
        startTime.setHours(slot.h, slot.mn, 0, 0);

        const endTime = new Date(startTime.getTime() + movie.duration * 60 * 1000);

        await prisma.showtime.create({
          data: {
            movieId: movie.id,
            roomId: room.id,
            startTime,
            endTime,
            price: slot.price,
          },
        });
        showtimeCount++;
      }
    }
  }

  console.log(`✅ Hoàn tất gieo mầm CineCore thành công! Đã tạo ${showtimeCount} suất chiếu.`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
