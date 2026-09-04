<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex">
    <!-- Sidebar Navigation -->
    <aside class="w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col justify-between hidden md:flex">
      <div class="space-y-8">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
            P
          </div>
          <div>
            <h1 class="font-bold text-sm leading-tight text-white">Philanthroffee</h1>
            <p class="text-[10px] text-amber-400 font-medium">Admin Control Center</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1.5 text-xs font-semibold">
          <NuxtLink to="/admin" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span>📊</span> Dashboard Overview
          </NuxtLink>
          <NuxtLink to="/admin/orders" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors">
            <span>📋</span> Kelola Pesanan
          </NuxtLink>
          <NuxtLink to="/admin/payments" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors">
            <span>💳</span> Pembayaran & Rekonsiliasi
          </NuxtLink>
          <NuxtLink to="/admin/tables" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors">
            <span>📱</span> Meja & QR Table
          </NuxtLink>
          <NuxtLink to="/admin/settings" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors">
            <span>⚙️</span> Pengaturan Operasional
          </NuxtLink>
          <NuxtLink to="/staff/kds" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors">
            <span>👨‍🍳</span> Buka Barista KDS
          </NuxtLink>
        </nav>
      </div>

      <div class="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
        <span class="text-neutral-400">Philanthroffee v1.0</span>
        <NuxtLink to="/staff/login" class="text-rose-400 hover:underline">Logout</NuxtLink>
      </div>
    </aside>

    <!-- Main Content Panel -->
    <main class="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Dashboard Dashboard Admin</h1>
          <p class="text-xs text-neutral-400 mt-1">Ringkasan operasional dan kontrol sistem Philanthroffee.</p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/staff/kds"
            class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <span>👨‍🍳 Buka Display KDS</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Action Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <NuxtLink to="/admin/orders" class="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 hover:border-amber-500/50 transition-all space-y-3 group">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl font-bold">
            📋
          </div>
          <div>
            <h3 class="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">Order Management</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Pantau seluruh status pesanan customer.</p>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/payments" class="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 hover:border-amber-500/50 transition-all space-y-3 group">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold">
            💳
          </div>
          <div>
            <h3 class="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">Payment & Cashier</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Konfirmasi tunai kasir & rekonsiliasi.</p>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/tables" class="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 hover:border-amber-500/50 transition-all space-y-3 group">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl font-bold">
            📱
          </div>
          <div>
            <h3 class="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">Table & QR Code</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Kelola meja, generate & cetak QR meja.</p>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/settings" class="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 hover:border-amber-500/50 transition-all space-y-3 group">
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl font-bold">
            ⚙️
          </div>
          <div>
            <h3 class="font-bold text-sm text-white group-hover:text-purple-400 transition-colors">Operational Settings</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Pause pesanan & jam buka cafe.</p>
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>
