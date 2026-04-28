<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { GraphData } from '@/types/graph'
import { Graph } from '@antv/g6'

const props = defineProps<{
  data: GraphData
  layout: 'force' | 'radial' | 'dagre'
}>()

const el = ref<HTMLDivElement | null>(null)
let graph: any = null
let ro: ResizeObserver | null = null

const layoutCfg = computed(() => {
  if (props.layout === 'radial') return { type: 'radial', unitRadius: 80, preventOverlap: true }
  if (props.layout === 'dagre') return { type: 'dagre', rankdir: 'LR', nodesep: 24, ranksep: 36 }
  return { type: 'force', preventOverlap: true, linkDistance: 140 }
})

const renderGraph = () => {
  if (!el.value) return
  if (!graph) return
  const rect = el.value.getBoundingClientRect()
  graph.setSize([Math.floor(rect.width), Math.floor(rect.height)])
  graph.render()
}

const ensureGraph = () => {
  if (!el.value) return
  if (graph) return
  const rect = el.value.getBoundingClientRect()

  graph = new Graph({
    container: el.value,
    width: Math.floor(rect.width),
    height: Math.floor(rect.height),
    data: props.data as any,
    layout: layoutCfg.value as any,
    node: {
      style: (d: any) => {
        const type = d?.type as string
        const fill =
          type === 'Person'
            ? '#1677ff'
            : type === 'Job'
              ? '#fa8c16'
              : type === 'Skill'
                ? '#52c41a'
                : type === 'Project'
                  ? '#722ed1'
                  : '#8c8c8c'
        return {
          fill,
          stroke: '#ffffff',
          lineWidth: 2,
          labelText: d?.label,
          labelFill: '#0a0a0a',
          labelPlacement: 'bottom',
          size: type === 'Job' ? 40 : 32,
        }
      },
    },
    edge: {
      style: () => ({
        stroke: 'rgba(24,24,27,.35)',
        endArrow: true,
      }),
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
  })

  renderGraph()
}

onMounted(() => {
  ensureGraph()
  if (el.value) {
    ro = new ResizeObserver(() => renderGraph())
    ro.observe(el.value)
  }
})

watch(
  () => props.data,
  (d) => {
    if (!graph) ensureGraph()
    graph.setData(d as any)
    renderGraph()
  },
  { deep: true },
)

watch(
  () => props.layout,
  () => {
    if (!graph) return
    graph.setLayout(layoutCfg.value as any)
    renderGraph()
  },
)

onBeforeUnmount(() => {
  if (ro && el.value) ro.unobserve(el.value)
  ro = null
  if (graph) graph.destroy()
  graph = null
})
</script>

<template>
  <div ref="el" class="h-[560px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-white" />
</template>

