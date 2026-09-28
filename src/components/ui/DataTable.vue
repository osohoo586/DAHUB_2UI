<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import Pagination from './Pagination.vue'

const props = defineProps({
  columns: { type: Array, required: true }, // [{ key, label, align?, sortable?, format?, width?, numeric? }]
  rows: { type: Array, required: true },
  rowKey: { type: [String, Function], default: 'id' },
  pageSize: { type: Number, default: 0 },
  initialSort: { type: Object, default: null }, // { key, dir }
  dense: { type: Boolean, default: false },
  maxHeight: { type: String, default: '' },
  caption: { type: String, default: '' },
})
defineEmits(['row-click'])

const sort = ref(props.initialSort ?? { key: null, dir: 'asc' })
const page = ref(1)

function toggleSort(col) {
  if (!col.sortable) return
  if (sort.value.key === col.key) sort.value = { key: col.key, dir: sort.value.dir === 'asc' ? 'desc' : 'asc' }
  else sort.value = { key: col.key, dir: 'asc' }
}

const sorted = computed(() => {
  const { key, dir } = sort.value
  if (!key) return props.rows
  const col = props.columns.find((c) => c.key === key)
  const get = col?.sortValue ?? ((r) => r[key])
  return [...props.rows].sort((a, b) => {
    const x = get(a)
    const y = get(b)
    const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'mn')
    return dir === 'asc' ? r : -r
  })
})

const pages = computed(() => (props.pageSize ? Math.max(1, Math.ceil(sorted.value.length / props.pageSize)) : 1))
const visible = computed(() => (props.pageSize ? sorted.value.slice((page.value - 1) * props.pageSize, page.value * props.pageSize) : sorted.value))
watch(() => props.rows, () => (page.value = 1))

const keyOf = (row, i) => (typeof props.rowKey === 'function' ? props.rowKey(row, i) : row[props.rowKey] ?? i)
const cell = (col, row) => (col.format ? col.format(row[col.key], row) : row[col.key])
</script>

<template>
  <div class="dt">
    <div class="dt__scroll" :style="maxHeight ? { maxHeight } : null">
      <table class="dt__table" :class="{ 'is-dense': dense }">
        <caption v-if="caption" class="sr-only">{{ caption }}</caption>
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              :style="col.width ? { width: col.width } : null"
              :class="[`is-${col.align || (col.numeric ? 'right' : 'left')}`, { 'is-sortable': col.sortable }]"
              :aria-sort="sort.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined"
            >
              <button v-if="col.sortable" type="button" class="dt__sort" @click="toggleSort(col)">
                {{ col.label }}
                <AppIcon :name="sort.key === col.key ? (sort.dir === 'asc' ? 'arrow-up' : 'arrow-down') : 'sort'" :size="13" :class="{ 'is-on': sort.key === col.key }" />
              </button>
              <template v-else>{{ col.label }}</template>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in visible" :key="keyOf(row, i)" @click="$emit('row-click', row)">
            <td v-for="col in columns" :key="col.key" :class="[`is-${col.align || (col.numeric ? 'right' : 'left')}`, { 'is-num': col.numeric }]">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">{{ cell(col, row) }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!rows.length" class="dt__empty"><slot name="empty">Мэдээлэл алга.</slot></div>
    </div>
    <div v-if="pageSize && pages > 1" class="dt__foot">
      <span class="dt__count">{{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, rows.length) }} / {{ rows.length }}</span>
      <Pagination v-model="page" :pages="pages" />
    </div>
  </div>
</template>

<style scoped>
.dt { display: flex; flex-direction: column; min-width: 0; }
.dt__scroll { overflow: auto; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); }
.dt__table { width: 100%; font-size: var(--fs-sm); }
.dt__table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--surface-2);
  color: var(--text-3);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-xs);
  letter-spacing: 0.02em;
  text-align: left;
  padding: 11px 14px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.dt__table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  vertical-align: middle;
}
.dt__table.is-dense td { padding: 8px 14px; }
.dt__table.is-dense th { padding: 9px 14px; }
.dt__table tbody tr:last-child td { border-bottom: 0; }
.dt__table tbody tr { transition: background-color var(--dur-fast); }
.dt__table tbody tr:hover { background: var(--surface-hover); }
.is-right { text-align: right !important; }
.is-center { text-align: center !important; }
.is-num { font-variant-numeric: tabular-nums; white-space: nowrap; }
.dt__sort { display: inline-flex; align-items: center; gap: 4px; color: inherit; font: inherit; letter-spacing: inherit; }
.dt__sort:hover { color: var(--text); }
.dt__sort .icon { opacity: 0.5; }
.dt__sort .icon.is-on { opacity: 1; color: var(--primary); }
.is-right .dt__sort { flex-direction: row-reverse; }
.dt__empty { padding: var(--space-8); text-align: center; color: var(--text-3); }
.dt__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); margin-top: var(--space-3); }
.dt__count { font-size: var(--fs-xs); color: var(--text-3); font-variant-numeric: tabular-nums; }
</style>
