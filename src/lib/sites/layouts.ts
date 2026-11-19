import { getCategory, getProject, type PreviewKind, type Project } from "@/lib/showcase/catalog";
import { getComponentDef, type ComponentType } from "./components";
import { newUid, type CustomerSite, type PlacedComponent } from "./types";

type Block = [ComponentType, Record<string, string>?];

/**
 * Bố cục trang của từng lĩnh vực: mẫu trong kho được ráp từ các khối này.
 * Khối mua thêm có trong bố cục (sản phẩm, đặt lịch...) được tính vào giá mẫu.
 */
const LAYOUTS: Record<PreviewKind, Block[]> = {
  // Web bán hàng: dải cam kết, danh mục, flash sale, sản phẩm, tin tức, đăng ký nhận tin (giống các sàn và web shop lớn ở VN).
  shop: [
    ["hero"],
    ["policies"],
    ["categories", { title: "Mua theo danh mục" }],
    ["deals", { title: "Flash sale hôm nay" }],
    ["products", { title: "Sản phẩm bán chạy" }],
    ["features", { title: "Vì sao khách chọn mua ở đây" }],
    ["reviews", { title: "Khách hàng nói gì" }],
    ["blog", { title: "Cẩm nang mua sắm", items: "Cách chọn quà tặng ý nghĩa | Gợi ý theo dịp và ngân sách. | Cẩm nang\nBảo quản sản phẩm đúng cách | Dùng bền, giữ như mới lâu hơn. | Mẹo hay\nƯu đãi thành viên tháng này | Tích điểm, đổi quà, giảm thêm. | Khuyến mãi" }],
    ["faq", { items: "Bao lâu thì nhận được hàng? | Nội thành 2 giờ, tỉnh khác 2–3 ngày.\nCó được kiểm tra hàng trước khi nhận không? | Có, được mở hộp kiểm tra rồi mới thanh toán.\nĐổi trả thế nào? | Đổi trả trong 7 ngày nếu sản phẩm lỗi hoặc không vừa." }],
    ["newsletter", { title: "Nhận mã giảm giá mỗi tuần" }],
  ],
  // Trung tâm đào tạo: số liệu, khoá học, lộ trình, giảng viên, lịch khai giảng, đăng ký kiểm tra đầu vào.
  edu: [
    ["hero"],
    ["stats", { items: "12.000+ | Học viên\n96% | Hoàn thành khoá\n4,9/5 | Đánh giá\n150+ | Bài học" }],
    ["products", { title: "Khoá học nổi bật" }],
    ["steps", { title: "Lộ trình học", sub: "Rõ ràng từ buổi đầu, biết mình đang ở đâu và đi tới đâu.", items: "Kiểm tra đầu vào | Đánh giá trình độ miễn phí trong 30 phút\nXếp lớp phù hợp | Lớp nhỏ, cùng trình độ, cùng mục tiêu\nHọc và luyện tập | Bài tập mỗi buổi, giáo viên chữa chi tiết\nĐánh giá đầu ra | Cam kết đầu ra, chưa đạt học lại miễn phí" }],
    ["team", { title: "Đội ngũ giảng viên", items: "Nguyễn Thảo Vy | Trưởng bộ môn | 12 năm giảng dạy\nPhạm Đức Long | Giảng viên | Thạc sĩ chuyên ngành\nĐỗ Khánh Linh | Giảng viên | Chứng chỉ quốc tế\nVũ Hoàng Nam | Trợ giảng | Kèm 1-1 sau giờ học" }],
    ["schedule", { title: "Lịch học trong tuần", times: "8:00, 18:00, 19:45" }],
    ["features", { title: "Vì sao học viên chọn chúng tôi" }],
    ["reviews", { title: "Học viên nói gì" }],
    ["faq", { items: "Học online hay tại lớp? | Cả hai, bạn chọn khi đăng ký.\nCó học thử không? | Có buổi học thử miễn phí.\nHọc phí trả thế nào? | Chuyển khoản hoặc trả góp 0%." }],
    ["booking", { title: "Đăng ký kiểm tra đầu vào miễn phí" }],
  ],
  // Dịch vụ: điểm mạnh, quy trình, bảng giá, đội ngũ, hình ảnh, đặt lịch.
  service: [
    ["hero"],
    ["features"],
    ["steps", { title: "Quy trình làm việc", items: "Tiếp nhận | Gọi, nhắn Zalo hoặc đặt lịch online\nKhảo sát & báo giá | Báo giá rõ ràng trước khi làm\nThực hiện | Đúng hẹn, gọn gàng, cập nhật qua Zalo\nBảo hành | Bảo hành bằng văn bản, hỗ trợ tận nơi" }],
    ["products", { title: "Bảng giá dịch vụ" }],
    ["team", { title: "Đội ngũ kỹ thuật", items: "Trần Văn Khoa | Trưởng nhóm | 10 năm kinh nghiệm\nLê Minh Tâm | Kỹ thuật viên | Chứng chỉ nghề\nNguyễn Hữu Phúc | Kỹ thuật viên | Tận tâm, đúng giờ" }],
    ["gallery", { title: "Công trình đã làm" }],
    ["reviews"],
    ["booking"],
    ["faq", { items: "Có cần đặt lịch trước không? | Nên đặt trước 1 ngày để có giờ đẹp.\nĐổi lịch được không? | Báo trước 2 giờ là đổi được.\nThanh toán thế nào? | Tiền mặt, chuyển khoản hoặc thẻ." }],
  ],
  // Landing page: đối tác, lợi ích, cách hoạt động, số liệu, bảng gói, đánh giá, form.
  landing: [
    ["hero"],
    ["partners", { title: "Được tin dùng bởi" }],
    ["features"],
    ["steps", { title: "Bắt đầu trong 3 bước", items: "Đăng ký | Điền thông tin trong 1 phút\nNhận tư vấn | Chuyên viên gọi lại trong 15 phút\nNhận ưu đãi | Áp dụng ngay cho đơn đầu tiên" }],
    ["stats"],
    ["plans", { title: "Chọn gói phù hợp" }],
    ["reviews"],
    ["faq", { items: "Ưu đãi kéo dài đến khi nào? | Đến hết tháng hoặc khi hết suất.\nCó mất phí tư vấn không? | Hoàn toàn miễn phí.\nThông tin của tôi có được bảo mật? | Chỉ dùng để liên hệ tư vấn, không chia sẻ." }],
    ["cta", { title: "Đăng ký nhận ưu đãi ra mắt", button: "Đăng ký ngay" }],
    ["contact", { title: "Để lại thông tin" }],
  ],
  // Không gian 3D, nhà mẫu: số liệu, phối cảnh, tiện ích, loại căn, quy trình xem nhà.
  space3d: [
    ["hero"],
    ["stats", { items: "360° | Tham quan ảo\n12 | Mẫu căn\n3 phút | Xem hết nhà mẫu\n24/7 | Xem mọi lúc" }],
    ["gallery", { title: "Không gian thực tế" }],
    ["features"],
    ["products", { title: "Các loại căn" }],
    ["steps", { title: "Xem nhà thế nào", items: "Tham quan online | Xoay 360°, xem từng phòng\nChọn căn ưng ý | So sánh diện tích, hướng, tầng\nHẹn xem thực tế | Chuyên viên đón và dẫn xem\nNhận báo giá | Chính sách và tiến độ thanh toán" }],
    ["contact", { title: "Đặt lịch xem nhà" }],
  ],
  // Tuyển dụng: số liệu, ngành nghề, việc làm mới, nhà tuyển dụng, quy trình ứng tuyển, cẩm nang.
  jobs: [
    ["hero"],
    ["stats", { items: "1.200+ | Việc làm\n350+ | Doanh nghiệp\n48 giờ | Phản hồi hồ sơ\n92% | Ứng viên hài lòng" }],
    ["categories", { title: "Ngành nghề", items: "Công nghệ thông tin | 320+ việc\nKinh doanh – bán hàng | 280+ việc\nKế toán – tài chính | 150+ việc\nMarketing | 120+ việc\nSản xuất – kỹ thuật | 210+ việc\nNhà hàng – khách sạn | 90+ việc" }],
    ["products", { title: "Việc làm mới" }],
    ["partners", { title: "Nhà tuyển dụng hàng đầu" }],
    ["steps", { title: "Ứng tuyển trong 4 bước", items: "Tạo hồ sơ | Tải CV hoặc điền nhanh trong 3 phút\nChọn việc phù hợp | Lọc theo ngành, lương, địa điểm\nPhỏng vấn | Nhận lịch hẹn qua Zalo, email\nNhận việc | Hỗ trợ thủ tục, theo dõi 2 tháng đầu" }],
    ["features"],
    ["blog", { title: "Cẩm nang nghề nghiệp", items: "Viết CV gây ấn tượng trong 6 giây | Bố cục, từ khoá và lỗi nên tránh. | CV\nTrả lời câu hỏi lương mong muốn | Cách đàm phán khéo, không mất điểm. | Phỏng vấn\nNgành nào đang tuyển nhiều? | Tổng hợp xu hướng tuyển dụng quý này. | Thị trường" }],
    ["cta", { title: "Doanh nghiệp cần tuyển gấp?", text: "Đăng tin trong 5 phút, nhận hồ sơ ngay hôm nay.", button: "Đăng tin tuyển dụng" }],
    ["contact", { title: "Gửi hồ sơ, đăng tin" }],
  ],
  // Game: tính năng, số liệu, cách chơi, tin cập nhật.
  game: [
    ["hero"],
    ["features"],
    ["stats", { items: "50.000+ | Lượt chơi\nTop 100 | Bảng xếp hạng\nMỗi ngày | Thử thách mới\n100% | Miễn phí" }],
    ["steps", { title: "Cách chơi", items: "Mở trình duyệt | Không cần cài đặt, chơi trên mọi máy\nChọn chế độ | Chơi một mình hoặc thách đấu bạn bè\nLeo hạng | Tích điểm mỗi ngày, lên bảng xếp hạng\nNhận quà | Đổi điểm lấy vật phẩm và phần thưởng" }],
    ["gallery", { title: "Hình ảnh trong game" }],
    ["blog", { title: "Tin cập nhật", items: "Mùa giải mới đã mở | Bảng xếp hạng làm mới, phần thưởng gấp đôi. | Sự kiện\nBản cập nhật tháng này | Thêm màn chơi và nhân vật mới. | Cập nhật\nMẹo leo hạng nhanh | Chiến thuật từ người chơi top 10. | Hướng dẫn" }],
    ["faq", { items: "Có mất phí không? | Chơi miễn phí, vật phẩm trang trí là tuỳ chọn.\nChơi trên điện thoại được không? | Được, chạy mượt trên mọi trình duyệt.\nMất tiến trình khi đổi máy? | Đăng nhập là đồng bộ ngay." }],
    ["cta", { title: "Chơi ngay, không cần cài đặt", button: "Bắt đầu chơi" }],
  ],
  // Ứng dụng AI / phần mềm: đối tác, tính năng, cách hoạt động, bảng giá gói, đánh giá.
  ai: [
    ["hero"],
    ["partners", { title: "Đội ngũ tin dùng" }],
    ["features"],
    ["steps", { title: "Hoạt động thế nào", items: "Kết nối dữ liệu | Tải tài liệu hoặc nối với công cụ sẵn có\nĐặt yêu cầu | Gõ bằng tiếng Việt như nói chuyện\nNhận kết quả | Vài giây, sửa lại dễ dàng\nLàm việc nhóm | Chia sẻ, phân quyền, lưu lịch sử" }],
    ["stats", { items: "10x | Nhanh hơn\n99,9% | Thời gian hoạt động\n5.000+ | Người dùng\n24/7 | Hỗ trợ" }],
    ["plans", { title: "Bảng giá", items: "Miễn phí | 0đ | 50 lượt mỗi tháng; Tính năng cơ bản | tháng\nChuyên nghiệp | 299000 | Không giới hạn lượt; Mọi tính năng; Hỗ trợ ưu tiên | tháng\nDoanh nghiệp | Liên hệ | Triển khai riêng; Bảo mật nâng cao; Quản lý tài khoản riêng" }],
    ["reviews", { title: "Người dùng nói gì" }],
    ["faq", { items: "Dữ liệu có an toàn không? | Dữ liệu được mã hoá và không dùng để huấn luyện.\nCó dùng thử không? | Có 14 ngày dùng thử miễn phí.\nHuỷ gói thế nào? | Huỷ bất cứ lúc nào trong phần cài đặt." }],
    ["cta", { title: "Dùng thử 14 ngày miễn phí", button: "Dùng thử" }],
  ],
  // Showroom ô tô, xe máy: dòng xe, cam kết, mua trả góp, lái thử, chi nhánh.
  auto: [
    ["hero"],
    ["products", { title: "Xe đang bán" }],
    ["policies", { items: "Bảo hành chính hãng | 5 năm hoặc 150.000 km\nTrả góp 80% | Duyệt hồ sơ trong 24 giờ\nĐổi xe cũ lấy xe mới | Định giá miễn phí tại chỗ\nGiao xe tận nhà | Hỗ trợ đăng ký, đăng kiểm" }],
    ["steps", { title: "Mua xe trả góp", items: "Chọn xe | Lái thử và nhận báo giá lăn bánh\nNộp hồ sơ | CMND, sổ hộ khẩu, chứng minh thu nhập\nNgân hàng duyệt | Có kết quả trong 24 giờ\nNhận xe | Ký hợp đồng, nhận xe ngay trong ngày" }],
    ["gallery", { title: "Showroom" }],
    ["booking", { title: "Đăng ký lái thử" }],
    ["locations", { title: "Hệ thống showroom", items: "Showroom Phạm Văn Đồng | 520 Phạm Văn Đồng, Thủ Đức, TP.HCM | 7:30 – 19:00 | 0903 111 222\nShowroom Giải Phóng | 368 Giải Phóng, Hà Nội | 7:30 – 19:00 | 0904 333 444" }],
    ["faq", { items: "Giá lăn bánh gồm những gì? | Giá xe, phí trước bạ, biển số, đăng kiểm và bảo hiểm.\nTrả trước tối thiểu bao nhiêu? | Từ 20% giá trị xe.\nCó xe lái thử tại nhà không? | Có, đặt lịch trước 1 ngày." }],
    ["contact", { title: "Nhận báo giá lăn bánh" }],
  ],
  // Nhà hàng, quán: cam kết, nhóm món, thực đơn, combo, câu chuyện, không gian, chi nhánh, đặt bàn.
  food: [
    ["hero"],
    ["policies", { items: "Nguyên liệu tươi mỗi sáng | Nhập trong ngày, không để qua đêm\nGiao trong 30 phút | Bán kính 5 km, giữ nóng\nĐặt bàn miễn phí | Giữ bàn 15 phút\nPhòng riêng | Tiếp khách, sinh nhật, liên hoan" }],
    ["products", { title: "Món được gọi nhiều" }],
    ["deals", { title: "Combo giờ vàng", percent: "15" }],
    ["about", { title: "Câu chuyện của quán" }],
    ["gallery", { title: "Không gian quán" }],
    ["reviews", { title: "Thực khách nói gì" }],
    ["locations", { title: "Chi nhánh", items: "Cơ sở Nguyễn Huệ | 45 Nguyễn Huệ, Q.1, TP.HCM | 10:00 – 22:30 | 0901 888 999\nCơ sở Phan Xích Long | 102 Phan Xích Long, Phú Nhuận | 10:00 – 22:30 | 0901 777 666" }],
    ["booking", { title: "Đặt bàn" }],
  ],
  // Homestay, khách sạn, tour: phòng, tiện nghi, hình ảnh, lịch trình gợi ý, vị trí, đặt chỗ.
  travel: [
    ["hero"],
    ["products", { title: "Phòng & trải nghiệm" }],
    ["features", { title: "Tiện nghi" }],
    ["gallery", { title: "Khoảnh khắc" }],
    ["timeline", { title: "Lịch trình gợi ý 2 ngày 1 đêm", done: "0", items: "Ngày 1 – Sáng | Nhận phòng sớm, ăn sáng đặc sản\nNgày 1 – Chiều | Tham quan, chụp ảnh hoàng hôn\nNgày 1 – Tối | BBQ, lửa trại, chợ đêm\nNgày 2 – Sáng | Săn mây, cà phê view đẹp, trả phòng" }],
    ["reviews", { title: "Khách lưu trú nói gì" }],
    ["locations", { title: "Vị trí", items: "Cách trung tâm 5 phút | Gần chợ, quán ăn, điểm check-in | Nhận phòng 14:00 | 0905 246 810\nĐón tiễn sân bay | Xe 7 chỗ, đặt trước 1 ngày | 24/7 | 0905 246 810" }],
    ["booking", { title: "Đặt chỗ" }],
    ["faq", { items: "Nhận và trả phòng lúc mấy giờ? | Nhận phòng 14:00, trả phòng 12:00.\nĐặt cọc thế nào? | Cọc 30% qua chuyển khoản, phần còn lại trả khi nhận phòng.\nHuỷ phòng có mất cọc không? | Huỷ trước 3 ngày được hoàn cọc 100%." }],
  ],
  // Phòng khám, nha khoa: số liệu, chuyên khoa, bác sĩ, quy trình khám, bảng giá, bảo hiểm, đặt lịch, chi nhánh.
  health: [
    ["hero"],
    ["stats", { items: "15+ | Năm kinh nghiệm\n20.000+ | Lượt khám mỗi năm\n4,9/5 | Đánh giá\nCả tuần | Mở cửa" }],
    ["features", { title: "Vì sao chọn chúng tôi" }],
    ["team", { title: "Đội ngũ bác sĩ", items: "BS.CKII Nguyễn Văn Bình | Giám đốc chuyên môn | 25 năm kinh nghiệm\nThS.BS Trần Ngọc Mai | Bác sĩ điều trị | Tu nghiệp tại Nhật Bản\nBS Lê Hoàng Phúc | Bác sĩ điều trị | Chuyên điều trị không đau\nĐD Phạm Thu Trang | Điều dưỡng trưởng | Chăm sóc tận tình" }],
    ["steps", { title: "Quy trình khám", items: "Đặt lịch | Online hoặc gọi hotline, không phải chờ\nThăm khám | Bác sĩ khám và tư vấn kỹ\nĐiều trị | Phác đồ rõ ràng, báo chi phí trước\nTái khám | Nhắc lịch qua Zalo, theo dõi sau điều trị" }],
    ["products", { title: "Bảng giá dịch vụ" }],
    ["policies", { title: "", items: "Bảo hiểm y tế | Áp dụng thẻ BHYT đúng tuyến\nBảo hiểm tư nhân | Bảo Việt, PVI, Liberty...\nTrả góp 0% | Qua thẻ tín dụng\nHoá đơn đầy đủ | Xuất hoá đơn điện tử" }],
    ["reviews", { title: "Bệnh nhân nói gì" }],
    ["booking", { title: "Đặt lịch khám" }],
    ["locations", { title: "Địa chỉ phòng khám", items: "Cơ sở chính | 215 Hồng Bàng, Q.5, TP.HCM | T2–CN 7:00 – 20:00 | 1900 6868\nCơ sở 2 | 18 Nguyễn Chí Thanh, Đống Đa, Hà Nội | T2–CN 7:00 – 20:00 | 1900 6868" }],
    ["faq", { items: "Có cần đặt lịch trước không? | Nên đặt trước để không phải chờ, khách vãng lai vẫn được tiếp nhận.\nCó áp dụng bảo hiểm không? | Có, chấp nhận bảo hiểm y tế và bảo hiểm sức khoẻ tư nhân.\nBao lâu có kết quả xét nghiệm? | Thường trong ngày, gửi qua Zalo." }],
  ],
  // Dự án bất động sản: tổng quan, tiện ích, phối cảnh, bảng giá, phương thức thanh toán, tiến độ, vị trí, tin dự án.
  realestate: [
    ["hero"],
    ["stats", { items: "2,4 ha | Tổng diện tích\n1.200 | Căn hộ\n42 | Tiện ích nội khu\n2027 | Bàn giao" }],
    ["about", { title: "Tổng quan dự án" }],
    ["features", { title: "Tiện ích nổi bật" }],
    ["gallery", { title: "Phối cảnh và nhà mẫu" }],
    ["products", { title: "Bảng giá" }],
    ["steps", { title: "Phương thức thanh toán", items: "Đặt cọc | Giữ căn, ký thoả thuận đặt cọc\nKý hợp đồng | Thanh toán 15%, ngân hàng hỗ trợ vay đến 70%\nTheo tiến độ | Mỗi đợt 5% theo tiến độ xây dựng\nNhận nhà | Thanh toán 30%, 5% còn lại khi nhận sổ" }],
    ["timeline", { title: "Tiến độ xây dựng", done: "3", items: "Q2/2025 | Khởi công, hoàn thiện móng\nQ1/2026 | Cất nóc block A\nQ3/2026 | Cất nóc block B, C\nQ2/2027 | Hoàn thiện mặt ngoài, tiện ích\nQ4/2027 | Bàn giao căn hộ" }],
    ["locations", { title: "Vị trí & liên kết vùng", items: "Nhà mẫu dự án | Mặt tiền đại lộ, cách trung tâm 15 phút | 8:00 – 18:00 mỗi ngày | 0909 555 777\nKết nối | 5 phút tới trường quốc tế, 10 phút tới bệnh viện, 15 phút tới sân bay |  | " }],
    ["blog", { title: "Tin dự án", items: "Cất nóc block A vượt tiến độ | Sớm hơn kế hoạch 1 tháng. | Tiến độ\nNgân hàng bảo lãnh dự án | Hỗ trợ vay 70%, ân hạn gốc 24 tháng. | Tài chính\nKhai trương nhà mẫu | Mời tham quan cuối tuần này. | Sự kiện" }],
    ["faq", { items: "Pháp lý dự án thế nào? | Đã có giấy phép xây dựng, sổ hồng lâu dài cho người Việt.\nThanh toán ra sao? | Thanh toán theo tiến độ, ngân hàng hỗ trợ vay đến 70%.\nKhi nào bàn giao? | Dự kiến quý 4/2027, bàn giao hoàn thiện cơ bản." }],
    ["contact", { title: "Nhận bảng giá và chính sách" }],
  ],
  // Salon, spa, nail: dịch vụ, quy trình, thợ, tác phẩm, thẻ thành viên, chi nhánh, đặt lịch.
  beauty: [
    ["hero"],
    ["products", { title: "Bảng giá dịch vụ" }],
    ["steps", { title: "Trải nghiệm tại tiệm", items: "Đặt lịch | Chọn dịch vụ, thợ và giờ đẹp\nTư vấn | Soi da, tư vấn kiểu phù hợp gương mặt\nThực hiện | Sản phẩm chính hãng, dụng cụ tiệt trùng\nChăm sóc tại nhà | Hướng dẫn giữ kết quả lâu" }],
    ["team", { title: "Thợ & kỹ thuật viên", items: "Mai Anh | Thợ chính | 8 năm kinh nghiệm\nBảo Ngọc | Kỹ thuật viên | Chuyên chăm sóc da\nThanh Tú | Thợ chính | Chuyên kiểu Hàn Quốc\nKim Chi | Kỹ thuật viên | Tỉ mỉ, nhẹ tay" }],
    ["gallery", { title: "Tác phẩm" }],
    ["plans", { title: "Thẻ thành viên", items: "Bạc | 1000000 | Giảm 5% mọi dịch vụ; Tặng 1 lần gội dưỡng | năm\nVàng | 3000000 | Giảm 10% mọi dịch vụ; Ưu tiên đặt lịch; Quà sinh nhật | năm\nKim cương | 6000000 | Giảm 15% mọi dịch vụ; Thợ chính riêng; Đồ uống miễn phí | năm" }],
    ["reviews", { title: "Khách nói gì" }],
    ["locations", { title: "Địa chỉ tiệm", items: "Chi nhánh 1 | 27 Trần Quang Khải, Q.1, TP.HCM | 9:00 – 21:00 | 0938 123 456\nChi nhánh 2 | 64 Hoàng Hoa Thám, Ba Đình, Hà Nội | 9:00 – 21:00 | 0938 654 321" }],
    ["booking", { title: "Đặt lịch" }],
    ["faq", { items: "Có cần đặt lịch trước không? | Nên đặt trước để chọn được thợ và giờ đẹp.\nĐến trễ có sao không? | Giữ lịch 15 phút, quá giờ sẽ xếp lượt kế tiếp.\nCó gửi xe không? | Có chỗ gửi xe máy miễn phí trước tiệm." }],
  ],
  // Phòng gym, yoga, sân thể thao: số liệu, lịch lớp, bộ môn, huấn luyện viên, gói tập, tập thử.
  fitness: [
    ["hero"],
    ["stats", { items: "40+ | Buổi lớp mỗi tuần\n12 | Huấn luyện viên\n5:30 – 22:00 | Mở cửa\n3 ngày | Tập thử miễn phí" }],
    ["schedule", { title: "Lịch lớp trong tuần", times: "6:00, 17:30, 19:00" }],
    ["features", { title: "Bộ môn" }],
    ["team", { title: "Huấn luyện viên", items: "Hoàng Anh Tuấn | HLV trưởng | Chứng chỉ quốc tế\nNguyễn Bảo Trâm | HLV nhóm | Chuyên lớp cường độ cao\nLý Gia Huy | HLV cá nhân | Giảm mỡ, tăng cơ\nĐặng Thu Thủy | HLV | Phục hồi, giãn cơ" }],
    ["plans", { title: "Gói tập", items: "1 tháng | 590000 | Tập không giới hạn; Tủ đồ, phòng tắm | tháng\n6 tháng | 2900000 | Tiết kiệm 18%; 2 buổi PT miễn phí; Bảo lưu 15 ngày | 6 tháng\n12 tháng | 4900000 | Tiết kiệm 30%; 4 buổi PT miễn phí; Bảo lưu 30 ngày | năm" }],
    ["products", { title: "Dịch vụ thêm" }],
    ["gallery", { title: "Không gian tập" }],
    ["reviews", { title: "Hội viên nói gì" }],
    ["booking", { title: "Đăng ký tập thử" }],
    ["faq", { items: "Người mới tập được không? | Được, huấn luyện viên hướng dẫn từ buổi đầu.\nCó tủ đồ, phòng tắm không? | Có tủ khoá và phòng tắm nước nóng.\nBảo lưu gói được không? | Bảo lưu tối đa 30 ngày mỗi năm." }],
  ],
};

export function layoutTypes(project: Project): ComponentType[] {
  const kind = getCategory(project.category)?.kind ?? "shop";
  return LAYOUTS[kind].map(([t]) => t);
}

/** Các khối của mẫu, sẵn sàng gắn vào vùng Nội dung (bỏ những loại chỉ đặt một lần đã có). */
export function templateBlocks(project: Project, existing: Set<ComponentType> = new Set(), uid: (i: number) => string = () => newUid()): PlacedComponent[] {
  const kind = getCategory(project.category)?.kind ?? "shop";
  return LAYOUTS[kind]
    .filter(([t]) => !(getComponentDef(t)?.unique && existing.has(t)))
    .map(([type, props], i) => ({ uid: uid(i), type, props: { ...(getComponentDef(type)?.defaults ?? {}), ...(props ?? {}) }, included: true }));
}

/** Web tạo trước khi có bố cục khối: chèn các khối của mẫu lên đầu vùng Nội dung. */
export function withTemplateLayout(site: CustomerSite): CustomerSite {
  if (site.layout === 2) return site;
  const project = getProject(site.template);
  if (!project) return { ...site, layout: 2 };
  const existing = new Set(site.regions.main.map((c) => c.type));
  // uid cố định để đọc lại nhiều lần vẫn ra cùng kết quả (không bị coi là đã sửa).
  const blocks = templateBlocks(project, existing, (i) => `mau-${i}`);
  // Khối mua thêm đã có (sản phẩm, đặt lịch...) đứng sau banner và điểm nổi bật.
  const head = blocks.filter((b) => b.type === "hero" || b.type === "features");
  const tail = blocks.filter((b) => !head.includes(b));
  return { ...site, layout: 2, regions: { ...site.regions, main: [...head, ...site.regions.main, ...tail] } };
}
