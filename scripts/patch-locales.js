import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '../src/locales');
const locales = ['en.js', 'id.js', 'ms.js', 'tl.js', 'th.js', 'vi.js', 'km.js', 'lo.js', 'my.js'];

// The new translations to inject under the `home:` object
const newKeys = {
    en: {
        spotlight_title: "'Academy Spotlight'",
        spotlight_desc: "'Your current adventure across ASEAN'",
        open_academy: "'Open Academy →'",
        status_complete: "'✓ Complete'",
        status_simulation: "'Simulation'",
        status_in_progress: "'In Progress'",
        status_locked: "'Locked'",
        badge_done: "'DONE'",
        badge_active: "'ACTIVE'",
        badge_locked: "'LOCKED'",
        chapters_done: "'Chapters Done'",
        chapters_of: "'of {total} chapters'",
        lia_story: "'Lia\\'s ASEAN Story'",
        continue_training: "'Continue training'",
        complete_prev: "'Complete previous to access'",
        go_btn: "'GO →'"
    },
    id: {
        spotlight_title: "'Sorotan Akademi'",
        spotlight_desc: "'Petualangan Anda saat ini di ASEAN'",
        open_academy: "'Buka Akademi →'",
        status_complete: "'✓ Selesai'",
        status_simulation: "'Simulasi'",
        status_in_progress: "'Sedang Berjalan'",
        status_locked: "'Terkunci'",
        badge_done: "'SELESAI'",
        badge_active: "'AKTIF'",
        badge_locked: "'TERKUNCI'",
        chapters_done: "'Bab Selesai'",
        chapters_of: "'dari {total} bab'",
        lia_story: "'Kisah Lia di ASEAN'",
        continue_training: "'Lanjutkan pelatihan'",
        complete_prev: "'Selesaikan sebelumnya untuk akses'",
        go_btn: "'MULAI →'"
    },
    ms: {
        spotlight_title: "'Tumpuan Akademi'",
        spotlight_desc: "'Pengembaraan semasa anda di ASEAN'",
        open_academy: "'Buka Akademi →'",
        status_complete: "'✓ Selesai'",
        status_simulation: "'Simulasi'",
        status_in_progress: "'Sedang Berjalan'",
        status_locked: "'Terkunci'",
        badge_done: "'SELESAI'",
        badge_active: "'AKTIF'",
        badge_locked: "'TERKUNCI'",
        chapters_done: "'Bab Selesai'",
        chapters_of: "'daripada {total} bab'",
        lia_story: "'Kisah ASEAN Lia'",
        continue_training: "'Teruskan latihan'",
        complete_prev: "'Selesaikan sebelumnya untuk akses'",
        go_btn: "'MULA →'"
    },
    tl: {
        spotlight_title: "'Tampok sa Akademya'",
        spotlight_desc: "'Ang iyong kasalukuyang pakikipagsapalaran sa ASEAN'",
        open_academy: "'Buksan ang Akademya →'",
        status_complete: "'✓ Tapos na'",
        status_simulation: "'Simulasyon'",
        status_in_progress: "'Nagsasagawa'",
        status_locked: "'Naka-lock'",
        badge_done: "'TAPOS'",
        badge_active: "'AKTIBO'",
        badge_locked: "'Naka-lock'",
        chapters_done: "'Mga Kabanata na Tapos'",
        chapters_of: "'mula sa {total} kabanata'",
        lia_story: "'Kuwento ni Lia sa ASEAN'",
        continue_training: "'Ipagpatuloy ang pagsasanay'",
        complete_prev: "'Tapusin ang nauna para ma-access'",
        go_btn: "'PUMUNTA →'"
    },
    vi: {
        spotlight_title: "'Tiêu điểm Học viện'",
        spotlight_desc: "'Cuộc phiêu lưu hiện tại của bạn khắp ASEAN'",
        open_academy: "'Mở Học viện →'",
        status_complete: "'✓ Hoàn thành'",
        status_simulation: "'Mô phỏng'",
        status_in_progress: "'Đang tiến hành'",
        status_locked: "'Đã khóa'",
        badge_done: "'XONG'",
        badge_active: "'HOẠT ĐỘNG'",
        badge_locked: "'KHÓA'",
        chapters_done: "'Chương Đã Xong'",
        chapters_of: "'trên {total} chương'",
        lia_story: "'Câu chuyện ASEAN của Lia'",
        continue_training: "'Tiếp tục huấn luyện'",
        complete_prev: "'Hoàn thành phần trước để truy cập'",
        go_btn: "'ĐI →'"
    },
    th: {
        spotlight_title: "'จุดสนใจของสถาบัน'",
        spotlight_desc: "'การผจญภัยในปัจจุบันของคุณทั่วอาเซียน'",
        open_academy: "'เปิดสถาบัน →'",
        status_complete: "'✓ เสร็จสมบูรณ์'",
        status_simulation: "'การจำลอง'",
        status_in_progress: "'กำลังดำเนินการ'",
        status_locked: "'ถูกล็อค'",
        badge_done: "'เสร็จสิ้น'",
        badge_active: "'ใช้งานอยู่'",
        badge_locked: "'ล็อค'",
        chapters_done: "'บทที่เสร็จสิ้น'",
        chapters_of: "'จาก {total} บท'",
        lia_story: "'เรื่องราวอาเซียนของลิอา'",
        continue_training: "'ดำเนินการฝึกอบรมต่อ'",
        complete_prev: "'ทำให้เสร็จก่อนเพื่อเข้าถึง'",
        go_btn: "'ไป →'"
    },
    km: {
        spotlight_title: "'បណ្ឌិត្យសភា Spotlight'",
        spotlight_desc: "'ការផ្សងព្រេងបច្ចុប្បន្នរបស់អ្នកនៅអាស៊ាន'",
        open_academy: "'បើកបណ្ឌិត្យសភា →'",
        status_complete: "'✓ បានបញ្ចប់'",
        status_simulation: "'ការក្លែងធ្វើ'",
        status_in_progress: "'កំពុងដំណើរការ'",
        status_locked: "'បានចាក់សោ'",
        badge_done: "'រួចរាល់'",
        badge_active: "'សកម្ម'",
        badge_locked: "'ចាក់សោ'",
        chapters_done: "'ជំពូកដែលបានបញ្ចប់'",
        chapters_of: "'នៃ {total} ជំពូក'",
        lia_story: "'រឿងអាស៊ានរបស់ Lia'",
        continue_training: "'បន្តការបណ្តុះបណ្តាល'",
        complete_prev: "'បំពេញមុនដើម្បីចូលប្រើ'",
        go_btn: "'ទៅ →'"
    },
    lo: {
        spotlight_title: "'ສະຖາບັນ Spotlight'",
        spotlight_desc: "'ການຜະຈົນໄພໃນປະຈຸບັນຂອງທ່ານທົ່ວອາຊຽນ'",
        open_academy: "'ເປີດສະຖາບັນ →'",
        status_complete: "'✓ ສໍາເລັດ'",
        status_simulation: "'ການຈຳລອງ'",
        status_in_progress: "'ກຳລັງດຳເນີນການ'",
        status_locked: "'ຖືກລັອກ'",
        badge_done: "'ສຳເລັດ'",
        badge_active: "'ເຄື່ອນໄຫວ'",
        badge_locked: "'ລັອກ'",
        chapters_done: "'ບົດສຳເລັດ'",
        chapters_of: "'ຈາກ {total} ບົດ'",
        lia_story: "'ເລື່ອງລາວອາຊຽນຂອງ Lia'",
        continue_training: "'ສືບຕໍ່ການຝຶກອົບຮົມ'",
        complete_prev: "'ເຮັດສຳເລັດກ່ອນເພື່ອເຂົ້າເຖິງ'",
        go_btn: "'ໄປ →'"
    },
    my: {
        spotlight_title: "'Academy Spotlight'",
        spotlight_desc: "'အာဆီယံတစ်ဝှမ်း သင့်လက်ရှိစွန့်စားမှု'",
        open_academy: "'Academy သို့သွားရန် →'",
        status_complete: "'✓ ပြီးမြောက်ပါပြီ'",
        status_simulation: "'ပုံစံတူ'",
        status_in_progress: "'လုပ်ဆောင်နေဆဲ'",
        status_locked: "'သော့ခတ်ထားသည်'",
        badge_done: "'ပြီးပြီ'",
        badge_active: "'တက်ကြွ'",
        badge_locked: "'လော့ခ်'",
        chapters_done: "'ပြီးစီးသောအခန်းများ'",
        chapters_of: "'{total} အခန်းထဲမှ'",
        lia_story: "'Lia ၏အာဆီယံဇာတ်လမ်း'",
        continue_training: "'သင်တန်းဆက်လုပ်ရန်'",
        complete_prev: "'ဝင်ရောက်ရန် အရင်တစ်ခုကို ပြီးအောင်လုပ်ပါ'",
        go_btn: "'သွားရန် →'"
    }
};

for (const file of locales) {
    const lang = file.replace('.js', '');
    const filePath = path.join(localesDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find where the `home: {` object ends by looking for the next top-level key or the end of the home block
    // A simple hack: look for `        activity: {` and replace it by inserting the new keys right before it.
    if (content.includes('activity: {')) {
        const insertion = `
        spotlight: {
            title: ${newKeys[lang].spotlight_title},
            desc: ${newKeys[lang].spotlight_desc},
            open: ${newKeys[lang].open_academy},
            status: {
                complete: ${newKeys[lang].status_complete},
                simulation: ${newKeys[lang].status_simulation},
                inProgress: ${newKeys[lang].status_in_progress},
                locked: ${newKeys[lang].status_locked}
            },
            badge: {
                done: ${newKeys[lang].badge_done},
                active: ${newKeys[lang].badge_active},
                locked: ${newKeys[lang].badge_locked}
            }
        },
        course: {
            chapters_done: ${newKeys[lang].chapters_done},
            chapters_of: ${newKeys[lang].chapters_of},
            story: ${newKeys[lang].lia_story},
            continue: ${newKeys[lang].continue_training},
            complete_prev: ${newKeys[lang].complete_prev},
            go: ${newKeys[lang].go_btn}
        },
        activity: {`;
        
        content = content.replace('activity: {', insertion.trimLeft());
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Patched " + file);
    } else {
        console.log("Could not find insertion point in " + file);
    }
}
