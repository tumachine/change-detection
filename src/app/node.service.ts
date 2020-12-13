import { Injectable } from '@angular/core';
import { TreeNode } from './tree/tree-node';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  nodes: TreeNode[] = [];
  currentNode: TreeNode | null = null;

  depth = 4;
  prevCurrentNode!: TreeNode | null;
  history: string[] = [];

  onCheck(name: string): void {
    this.history.push(name);
    console.log(this.history);
  }

  reset(): void {
    this.history = [];
  }

  currentNodeNext(node: TreeNode): void {
    // create new node
    // generate same array
    const treeCopy = [this.copyNode(this.nodes[0])];
    const foundNode = this.findNode(treeCopy[0], node);
    if (foundNode) {
      if (!this.prevCurrentNode) {
        this.prevCurrentNode = foundNode;
        foundNode.active = true;
      } else {
        this.prevCurrentNode.active = false;
        foundNode.active = true;
        this.prevCurrentNode = foundNode;
      }
      this.currentNode = foundNode;
      this.nodes = treeCopy;
    }
  }

  copyNode(node: TreeNode): TreeNode {
    const copyOfNode = this.createNode(node.path, node.parent);
    node.children.forEach(n => copyOfNode.children.push(this.copyNode(n)));
    return copyOfNode;
  }

  findNode(parent: TreeNode, node: TreeNode): TreeNode | null {
    if (parent.path.length === node.path.length) {
      return node;
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


  walkOverNodeChildren(operation: (n: TreeNode) => void, nodes: TreeNode[]): void {
    nodes.forEach(n => {
      operation(n);
      this.walkOverNodeChildren(operation, n.children);
    });
  }

  createNode(path: number[], parent: TreeNode | null, children: TreeNode[] = []): TreeNode {
    return { path, parent, children, active: false };
  }

  // always add at end, or at any place?
  addNode(node: TreeNode, index: number | null = null): void {
    const newNode = this.createNode([], node);
    if (index) {
      node.children.splice(index, 0, newNode);
      node.path = this.createNodePath(newNode, index);
      this.nameChildren(node, index);
    } else {
      node.children.push(newNode);
      newNode.path = this.createNodePath(node, node.children.length - 1);
    }
  }

  removeNode(node: TreeNode): void {
    if (node.parent) {
      const nodeIndex = node.parent.children.indexOf(node);
      node.parent.children = node.parent.children.splice(nodeIndex, 1);
      this.nameChildren(node.parent, nodeIndex);
    }
  }

  nameChildren(node: TreeNode, from = 0): void {
    for (let i = from; i < node.children.length; i++) {
      node.children[i].path = this.createNodePath(node, i);
      this.nameChildren(node.children[i], 0);
    }
  }

  checkNode(parent: TreeNode, childIndex: number): boolean {
    const correctPath = this.createNodePath(parent, childIndex);
    const correct = this.comparePaths(parent.path, correctPath);

    if (!correct) {
      console.log(`INCORRECT PATH: ${parent.path[childIndex]}, SHOULD BE: ${correctPath}`);
    }
    return correct;
  }

  comparePaths(pathOne: number[], pathTwo: number[]): boolean {
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

  checkNodeChildren(node: TreeNode): boolean {
    for (let i = 0; i < node.children.length; i++) {
      if (!this.checkNode(node, i) && !this.checkNodeChildren(node.children[i])) {
        return false;
      }
    }
    return true;
  }

  createNodePath(node: TreeNode, index: number): number[] {
    return node.path.concat(index);
  }

  createFirstNode(): TreeNode  {
    return this.createNode([0], null);
  }

  autogenerateNodes(depth: number, node: TreeNode, childrenNum: number): void {
    const generatedNode = this.generateNodes(depth, node, childrenNum);

    this.nodes = [generatedNode];
    this.currentNode = generatedNode;
    this.depth = depth;
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
}
