export interface TreeNode {
  path: number[];
  parent: TreeNode | null;
  active: boolean;
  children: TreeNode[];
}
