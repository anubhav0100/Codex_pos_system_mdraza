import type { ScopeNode } from '@/services/company/scopes-service'

export interface ScopeOption {
  id: number
  name: string
  scopeType: number
  depth: number
}

const flattenScopes = (nodes: ScopeNode[], depth = 0): ScopeOption[] =>
  nodes.flatMap((node) => [
    {
      id: node.id,
      name: node.name,
      scopeType: Number(node.scopeType),
      depth,
    },
    ...(node.children ? flattenScopes(node.children, depth + 1) : []),
  ])

const findScopeNode = (nodes: ScopeNode[], targetId: number): ScopeNode | null => {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node
    }
    if (node.children) {
      const match = findScopeNode(node.children, targetId)
      if (match) return match
    }
  }
  return null
}

export const getAccessibleScopeOptions = (tree: ScopeNode[], scopeNodeId?: number) => {
  if (!scopeNodeId) {
    return flattenScopes(tree)
  }
  const scopeNode = findScopeNode(tree, scopeNodeId)
  if (!scopeNode) {
    return []
  }
  return flattenScopes([scopeNode])
}

export const formatScopeOptionLabel = (option: ScopeOption) => {
  const indent = '\u00A0'.repeat(option.depth * 4)
  return `${indent}${option.name}`
}
