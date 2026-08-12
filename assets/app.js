(function () {
  const K = window.KaryaloDemo;
  let view = "dashboard";
  const nav = [
    { labelOnly: "Kelola toko" },
    { id: "dashboard", label: "Ringkasan", icon: "home" },
    { id: "products", label: "Produk & Katalog", icon: "box", badge: "8" },
    { id: "promotions", label: "Harga & Promosi", icon: "tag", badge: "2" },
    { id: "customers", label: "Pelanggan", icon: "users" },
    { id: "content", label: "Konten Store", icon: "edit" },
    { labelOnly: "Konfigurasi" },
    { id: "team", label: "Tim & Akses", icon: "users" },
    { id: "settings", label: "Pengaturan", icon: "settings" },
  ];
  const tour = [
    { selector: ".metric-grid", title: "Ringkasan toko dalam satu layar", text: "Owner langsung melihat produk aktif, promo, pelanggan, dan performa katalog tanpa membuka banyak alat." },
    { selector: ".product-table-card", title: "Kelola katalog tanpa developer", text: "Tambah produk, ubah harga, cek stok, dan terbitkan perubahan dari tabel katalog." },
    { selector: ".activity-card", title: "Perubahan dapat ditelusuri", text: "Aktivitas tim membantu owner memahami siapa mengubah apa dan kapan." },
    { selector: ".app-switcher", title: "Publish ke Store, lanjut ke Stock", text: "Perubahan katalog tampil di Store; stok dan fulfillment tetap dikelola lewat Karyalo Stock/OMS." },
  ];

  K.mount({ app: "cms", title: "Karyalo Manage", subtitle: "CMS / Kelola Toko · Alina Demo", nav, active: view, tour, onNavigate: navigate });
  navigate("dashboard");

  function navigate(next) {
    view = next;
    K.setActiveNav(view);
    ({ dashboard: renderDashboard, products: renderProducts, promotions: renderPromotions, customers: renderCustomers, content: renderContent, team: renderTeam, settings: renderSettings }[view] || renderDashboard)();
  }

  function renderDashboard() {
    const state = K.getState();
    const active = state.products.filter(product => product.status === "Aktif").length;
    const low = state.products.filter(product => product.stock > 0 && product.stock < 10).length;
    K.page(`${K.heading("Kelola Toko", "Selamat pagi, Ayu.", "Pantau katalog Alina dan terbitkan perubahan Store dari satu tempat.", `<button class="btn btn-secondary" data-preview>${K.icon("eye")} Lihat Store</button><button class="btn btn-primary" data-add-product>${K.icon("plus")} Tambah produk</button>`)}
      <div class="grid metric-grid">${K.metric("Produk aktif", K.number(active), "2 diperbarui minggu ini", "box")}${K.metric("Stok perlu perhatian", K.number(low), "Terhubung ke Karyalo Stock", "chart", "gold")}${K.metric("Promo berjalan", "2", "MIDMONTH paling aktif", "tag", "terra")}${K.metric("Pelanggan", K.number(state.customers.length + 1240), "+8,4% bulan ini", "users")}</div>
      <div class="grid grid-3">
        <section class="card product-table-card" style="grid-column:span 2"><div class="card-head"><div><h2>Produk yang perlu dicek</h2><span class="muted small">Stok rendah, habis, atau baru diperbarui</span></div><button class="btn btn-secondary btn-sm" data-go-products>Kelola katalog</button></div><div class="table-wrap"><table><thead><tr><th>Produk</th><th>Harga</th><th>Stok</th><th>Status</th><th></th></tr></thead><tbody>${state.products.slice(0,5).map(productRow).join("")}</tbody></table></div></section>
        <section class="card card-pad activity-card"><p class="eyebrow">Aktivitas tim</p><h2>Perubahan terbaru</h2><div class="list">${state.audit.map(item => `<div class="list-item"><span class="list-icon">${K.icon("edit")}</span><div class="list-copy"><strong>${item.action}</strong><span>${item.actor} · ${item.time}</span></div></div>`).join("")}</div></section>
      </div>
      <div class="grid grid-2 section-gap"><section class="card card-pad"><p class="eyebrow">Publish flow</p><h2>Dari perubahan admin ke pengalaman pelanggan</h2><div class="summary-strip"><div><span>1</span><strong>Edit produk</strong></div><div><span>2</span><strong>Review & publish</strong></div><div><span>3</span><strong>Store terbarui</strong></div></div></section><section class="card card-pad" style="background:var(--sage)"><p class="eyebrow">Peluang berikutnya</p><h2>3 produk hampir kehabisan stok</h2><p class="muted">Buka Stock/OMS untuk membuat adjustment atau merencanakan restock.</p><a class="btn btn-primary" href="${K.appHref("oms")}">Buka Karyalo Stock ${K.icon("arrow")}</a></section></div>`);
    bindCommon();
    document.querySelector("[data-go-products]").addEventListener("click", () => navigate("products"));
  }

  function productRow(product) {
    return `<tr><td><div class="cell-main">${product.name}</div><div class="cell-sub">${product.id} · ${product.category}</div></td><td>${K.money(product.price)}</td><td><strong>${product.stock}</strong></td><td>${K.status(product.status)}</td><td><button class="icon-btn" data-edit-product="${product.id}" aria-label="Edit ${product.name}">${K.icon("edit")}</button></td></tr>`;
  }

  function renderProducts() {
    const state = K.getState();
    K.page(`${K.heading("Produk & Katalog", "Kelola produk Alina", "Ubah informasi, harga, kategori, dan status publish tanpa menyentuh kode Store.", `<button class="btn btn-secondary" data-import>${K.icon("upload")} Import CSV</button><button class="btn btn-primary" data-add-product>${K.icon("plus")} Tambah produk</button>`)}
      <section class="card product-table-card"><div class="toolbar"><div class="search">${K.icon("search")}<input class="input" id="search" placeholder="Cari SKU atau nama produk..."></div><select class="select" id="filter"><option value="Semua">Semua status</option><option>Aktif</option><option>Stok rendah</option><option>Habis</option></select><button class="btn btn-secondary btn-sm">${K.icon("filter")} Filter</button></div><div class="table-wrap"><table><thead><tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="product-rows">${state.products.map(product => `<tr data-name="${product.name.toLowerCase()}" data-status="${product.status}"><td><div class="cell-main">${product.name}</div><div class="cell-sub">${product.id}</div></td><td><span class="tag">${product.category}</span></td><td>${K.money(product.price)}</td><td><strong>${product.stock}</strong></td><td>${K.status(product.status)}</td><td><button class="btn btn-secondary btn-sm" data-edit-product="${product.id}">${K.icon("edit")} Edit</button></td></tr>`).join("")}</tbody></table></div></section>`);
    bindCommon();
    const filterRows = () => { const query = document.getElementById("search").value.toLowerCase(); const status = document.getElementById("filter").value; document.querySelectorAll("#product-rows tr").forEach(row => row.hidden = !row.dataset.name.includes(query) || (status !== "Semua" && row.dataset.status !== status)); };
    document.getElementById("search").addEventListener("input", filterRows);
    document.getElementById("filter").addEventListener("change", filterRows);
    document.querySelector("[data-import]").addEventListener("click", () => K.toast("Contoh import: 8 produk lolos validasi, tidak ada duplikat."));
  }

  function bindCommon() {
    document.querySelectorAll("[data-add-product]").forEach(button => button.addEventListener("click", () => openProductForm()));
    document.querySelectorAll("[data-edit-product]").forEach(button => button.addEventListener("click", () => openProductForm(button.dataset.editProduct)));
    document.querySelector("[data-preview]")?.addEventListener("click", () => location.href = K.appHref("store"));
  }

  function openProductForm(id) {
    const product = id ? K.getState().products.find(item => item.id === id) : { id: "", name: "", category: "Atasan", price: 299000, stock: 20, status: "Aktif", color: "#c7d5cf" };
    K.modal(id ? "Edit produk" : "Tambah produk", `<form id="product-form" class="form-grid"><div class="field span-2"><label for="name">Nama produk</label><input class="input" id="name" required value="${K.escape(product.name)}" placeholder="Contoh: Aira Cotton Shirt"></div><div class="field"><label for="sku">SKU</label><input class="input" id="sku" required value="${K.escape(product.id || `AL-${String(Date.now()).slice(-3)}`)}"></div><div class="field"><label for="category">Kategori</label><select class="select" style="width:100%" id="category">${["Atasan","Dress","Outer","Bawahan"].map(name => `<option ${name === product.category ? "selected" : ""}>${name}</option>`).join("")}</select></div><div class="field"><label for="price">Harga</label><input class="input" id="price" type="number" min="0" value="${product.price}"></div><div class="field"><label for="stock">Stok awal</label><input class="input" id="stock" type="number" min="0" value="${product.stock}"></div><div class="field span-2"><label for="status">Status katalog</label><select class="select" style="width:100%" id="status"><option ${product.status === "Aktif" ? "selected" : ""}>Aktif</option><option ${product.status === "Draft" ? "selected" : ""}>Draft</option><option ${product.status === "Habis" ? "selected" : ""}>Habis</option></select></div></form>`, `<button class="btn btn-secondary" data-close-modal>Batal</button><button class="btn btn-primary" data-save-product>${K.icon("check")} Simpan & publish</button>`);
    document.querySelector("[data-save-product]").addEventListener("click", () => saveProduct(id));
  }

  function saveProduct(originalId) {
    const form = document.getElementById("product-form");
    if (!form.reportValidity()) return;
    const next = { id: document.getElementById("sku").value, name: document.getElementById("name").value, category: document.getElementById("category").value, price: Number(document.getElementById("price").value), stock: Number(document.getElementById("stock").value), status: document.getElementById("status").value, color: "#c7d5cf" };
    K.updateState(state => {
      const index = state.products.findIndex(item => item.id === originalId);
      if (index >= 0) state.products[index] = { ...state.products[index], ...next }; else state.products.unshift(next);
      state.audit.unshift({ action: `${next.name} ${index >= 0 ? "diperbarui" : "ditambahkan"}`, actor: "Ayu", time: "Baru saja" });
    });
    K.closeModal(); K.toast("Produk tersimpan dan siap tampil di Store."); renderProducts();
  }

  function renderPromotions() {
    const promos = [{ code:"MIDMONTH", name:"Mid-Month Edit", rule:"Diskon 15% min. Rp500.000", used:84, status:"Aktif", until:"18 Agu 2026" }, { code:"WELCOME10", name:"First Purchase", rule:"Diskon 10% pelanggan baru", used:43, status:"Aktif", until:"31 Agu 2026" }, { code:"SHIPFREE", name:"Free Shipping", rule:"Gratis ongkir min. Rp750.000", used:128, status:"Dijadwalkan", until:"1 Sep 2026" }];
    K.page(`${K.heading("Harga & Promosi", "Kampanye penjualan", "Buat promosi yang konsisten di Store dan ukur penggunaannya.", `<button class="btn btn-primary" data-new-promo>${K.icon("plus")} Buat promosi</button>`)}<div class="grid grid-3">${promos.map(promo => `<article class="card card-pad"><div style="display:flex;justify-content:space-between;gap:12px"><span class="tag">${promo.code}</span>${K.status(promo.status)}</div><h2 style="margin:18px 0 5px">${promo.name}</h2><p class="muted">${promo.rule}</p><div class="progress"><span style="width:${Math.min(promo.used,100)}%"></span></div><div style="display:flex;justify-content:space-between;margin-top:9px" class="small muted"><span>${promo.used} penggunaan</span><span>s.d. ${promo.until}</span></div></article>`).join("")}</div>`);
    document.querySelector("[data-new-promo]").addEventListener("click", () => K.toast("Draft promosi baru dibuat. Atur rule sebelum publish."));
  }

  function renderCustomers() {
    const customers = K.getState().customers;
    K.page(`${K.heading("Pelanggan", "Kenali pelanggan Alina", "Lihat histori belanja dan segmentasi sederhana untuk pelayanan yang lebih relevan.", `<button class="btn btn-secondary">${K.icon("download")} Export pelanggan</button>`)}<section class="card"><div class="toolbar"><div class="search">${K.icon("search")}<input class="input" placeholder="Cari nama atau email..."></div><span class="tag">1.244 pelanggan</span></div><div class="table-wrap"><table><thead><tr><th>Pelanggan</th><th>Pesanan</th><th>Total belanja</th><th>Segmen</th><th>Aksi</th></tr></thead><tbody>${customers.map(customer => `<tr><td><div class="cell-main">${customer.name}</div><div class="cell-sub">${customer.email}</div></td><td>${customer.orders}</td><td><strong>${K.money(customer.spent)}</strong></td><td><span class="tag">${customer.segment}</span></td><td><button class="btn btn-secondary btn-sm">Lihat histori</button></td></tr>`).join("")}</tbody></table></div></section>`);
  }

  function renderContent() {
    K.page(`${K.heading("Konten Store", "Atur tampilan beranda", "Kelola hero, koleksi unggulan, dan pengumuman Store tanpa deploy ulang.", `<button class="btn btn-secondary" data-content-preview>${K.icon("eye")} Preview</button><button class="btn btn-primary" data-publish>${K.icon("upload")} Publish</button>`)}<div class="grid grid-2"><section class="card card-pad"><h2>Hero campaign</h2><div class="form-grid"><div class="field span-2"><label>Eyebrow</label><input class="input" value="NEW SEASON · ALINA EDIT 2026"></div><div class="field span-2"><label>Headline</label><textarea class="textarea">Everyday pieces, made to feel like you.</textarea></div><div class="field span-2"><label>Deskripsi</label><textarea class="textarea">Koleksi pakaian perempuan dengan siluet ringan, warna hangat, dan detail yang mudah dipadukan.</textarea></div><div class="field"><label>Label CTA</label><input class="input" value="Belanja koleksi"></div><div class="field"><label>Tujuan CTA</label><input class="input" value="/collections/new-arrival"></div></div></section><section class="card card-pad" style="background:var(--pine);color:white"><p class="eyebrow" style="color:#efb49d">Preview storefront</p><h1 style="font-size:42px">Everyday pieces, made to feel like you.</h1><p style="color:rgba(255,255,255,.7)">Perubahan konten akan tampil ke pelanggan setelah Anda menekan Publish.</p><button class="btn btn-primary">Belanja koleksi ${K.icon("arrow")}</button></section></div>`);
    document.querySelector("[data-publish]").addEventListener("click", () => K.toast("Konten hero berhasil diterbitkan ke Store."));
    document.querySelector("[data-content-preview]").addEventListener("click", () => location.href = K.appHref("store"));
  }

  function renderTeam() {
    const team = [{name:"Ayu Sari",role:"Owner",access:"Semua akses",status:"Aktif"},{name:"Dimas Arif",role:"Catalog Admin",access:"Produk, promo, konten",status:"Aktif"},{name:"Nina Putri",role:"Customer Care",access:"Pelanggan, order",status:"Aktif"}];
    K.page(`${K.heading("Tim & Akses", "Atur siapa dapat melakukan apa", "Role membantu operasional tidak bergantung pada satu orang dan perubahan tetap terlacak.", `<button class="btn btn-primary">${K.icon("plus")} Undang anggota</button>`)}<div class="grid grid-3">${team.map(member => `<article class="card card-pad"><div class="avatar" style="margin-bottom:15px">${member.name.split(" ").map(n=>n[0]).join("")}</div><h3 style="margin-bottom:3px">${member.name}</h3><span class="muted">${member.role}</span><p class="small" style="margin:16px 0">${member.access}</p>${K.status(member.status)}</article>`).join("")}</div>`);
  }

  function renderSettings() {
    K.page(`${K.heading("Pengaturan", "Konfigurasi toko", "Identitas brand, domain, pembayaran, dan integrasi dalam satu area.", `<button class="btn btn-primary" data-save-settings>${K.icon("check")} Simpan</button>`)}<div class="grid grid-2"><section class="card card-pad"><h2>Identitas toko</h2><div class="form-grid"><div class="field span-2"><label>Nama toko</label><input class="input" value="Alina Official Store"></div><div class="field span-2"><label>Domain</label><input class="input" value="alinaofficial.store"></div><div class="field"><label>Mata uang</label><select class="select" style="width:100%"><option>IDR — Rupiah</option></select></div><div class="field"><label>Zona waktu</label><select class="select" style="width:100%"><option>Asia/Jakarta</option></select></div></div></section><section class="card card-pad"><h2>Koneksi produk</h2><div class="list"><div class="list-item"><span class="list-icon">${K.icon("orders")}</span><div class="list-copy"><strong>Karyalo Stock / OMS</strong><span>Order dan inventory tersambung</span></div>${K.status("Aktif")}</div><div class="list-item"><span class="list-icon">${K.icon("wallet")}</span><div class="list-copy"><strong>Karyalo Finance</strong><span>Penjualan diteruskan sebagai transaksi</span></div>${K.status("Aktif")}</div></div></section></div>`);
    document.querySelector("[data-save-settings]").addEventListener("click", () => K.toast("Pengaturan toko berhasil disimpan."));
  }
})();
