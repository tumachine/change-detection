import { Injectable } from '@angular/core';
import { TreeNode } from './tree/tree-node';

type UpdateTree = (foundNode: TreeNode) => void;

export interface TreeState {
  node: TreeNode;
  depth: number;
}

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  currentNode: TreeNode | null = null;

  treeState: TreeState = {
    depth: 4,
    node: this.createFirstNode(),
  };

  prevCurrentNode!: TreeNode | null;
  history: string[] = [];

  onCheck(name: string): void {
    this.history.push(name);
    console.log(this.history);
  }

  reset(): void {
    this.history = [];
  }

  changeCurrentNode: UpdateTree = (foundNode) => {
    if (!this.prevCurrentNode) {
      this.prevCurrentNode = foundNode;
      foundNode.active = true;
    } else {
      this.prevCurrentNode.active = false;
      foundNode.active = true;
      this.prevCurrentNode = foundNode;
    }
  }

  updateDepth(): void {
    const depths: number[] = [];
    this.getNodeDepths(this.treeState.node, depths);
    this.treeState = { ...this.treeState, depth: Math.max(...depths) };
  }

  addNode(node: TreeNode, updateTable: boolean = false): void {
    const newNode = this.createNode([], node);
    if (updateTable) {
      this.updateNodeTree(node, (foundNode) => this.insertNode(foundNode, newNode));
    } else {
      this.insertNode(node, newNode);
    }
  }

  insertNode(parent: TreeNode, node: TreeNode, index: number | null = null): void {
    if (index) {
      parent.children.splice(index, 0, node);
      node.path = this.createNodePath(node, index);
      this.nameChildren(parent, index);
    } else {
      parent.children.push(node);
      node.path = this.createNodePath(parent, parent.children.length - 1);
    }
  }

  updateNodeTree(node: TreeNode, updateTreeFn: UpdateTree): void {
    const treeCopy = this.copyNode(this.treeState.node);
    const foundNode = this.findNode(treeCopy, node);
    if (foundNode) {
      updateTreeFn(foundNode);
      this.currentNode = foundNode;
      this.treeState.node = treeCopy;
    }
  }

  removeNode: UpdateTree = (foundNode) => {
    if (foundNode?.parent) {
      const nodeIndex = foundNode.parent.children.indexOf(foundNode);
      foundNode.parent.children.splice(nodeIndex, 1);
      this.nameChildren(foundNode.parent);
    }
  }

  autogenerateNodes(depth: number, node: TreeNode, childrenNum: number): void {
    const generatedNode = this.generateNodes(depth, node, childrenNum);

    this.treeState.node = generatedNode;
    this.currentNode = generatedNode;
    this.treeState = { ...this.treeState, depth };
  }

  createFirstNode(): TreeNode  {
    return this.createNode([0], null);
  }

  private getNodeDepths(node: TreeNode, depths: number[], d = 1): void {
    if (node.children.length === 0) {
      depths.push(d);
      return;
    }
    node.children.forEach(child => this.getNodeDepths(child, depths, d + 1));
  }

  private nameChildren(node: TreeNode, from = 0): void {
    for (let i = from; i < node.children.length; i++) {
      node.children[i].path = this.createNodePath(node, i);
      this.nameChildren(node.children[i], 0);
    }
  }

  private walkOverNodeChildren(operation: (n: TreeNode) => void, nodes: TreeNode[]): void {
    nodes.forEach(n => {
      operation(n);
      this.walkOverNodeChildren(operation, n.children);
    });
  }

  private generateNodes(depth: number, node: TreeNode, childrenNum: number): TreeNode {
    if (depth <= 1) {
      return node;
    }
    for (let i = 0; i < childrenNum; i++) {
      this.addNode(node);
    }

    node.children.forEach(n => this.generateNodes(depth - 1, n, childrenNum));
    return node;
  }

  private copyNode(node: TreeNode, parent: TreeNode | null = null): TreeNode {
    const copyOfNode = this.createNode(node.path, parent);
    node.children.forEach(n => copyOfNode.children.push(this.copyNode(n, copyOfNode)));
    return copyOfNode;
  }

  private createNode(path: number[], parent: TreeNode | null, children: TreeNode[] = []): TreeNode {
    return { path, parent, children, active: false };
  }

  private createNodePath(node: TreeNode, index: number): number[] {
    return node.path.concat(index);
  }

  private comparePaths(pathOne: number[], pathTwo: number[]): boolean {
    if (pathOne.length !== pathTwo.length) {
      return false;
    }

    for (let i = 0; i < pathOne.length; i++) {
      if (pathOne[i] !== pathTwo[i]) {
        return false;
      }
    }
    return true;
  }

  private checkNodeChildren(node: TreeNode): boolean {
    for (let i = 0; i < node.children.length; i++) {
      if (!this.checkNode(node, i) || !this.checkNodeChildren(node.children[i])) {
        return false;
      }
    }
    return true;
  }

  private checkNode(parent: TreeNode, childIndex: number): boolean {
    const correctPath = this.createNodePath(parent, childIndex);
    const correct = this.comparePaths(parent.path, correctPath);

    if (!correct) {
      console.error(`INCORRECT PATH: ${parent.path[childIndex]}, SHOULD BE: ${correctPath}`);
    }
    return correct;
  }

  private findNode(parent: TreeNode, node: TreeNode): TreeNode | null {
    if (parent.path.length === node.path.length) {
      return parent;
    }

    if (parent.path.length > node.path.length) {
      return null;
    }

    let children = parent.children;
    for (let i = parent.path.length; i < node.path.length - 1; i++) {
      children = children[node.path[i]].children;
    }
    return children[node.path[node.path.length - 1]];
  }

}
