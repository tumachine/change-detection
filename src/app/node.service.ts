import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { TreeNode } from './node';
import { TreeNodeComponent } from './tree/tree-node/tree-node.component';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  root!: TreeNode;
  history: TreeNode[] = [];
  depth = new BehaviorSubject<number>(0);
  currentNode = new BehaviorSubject<TreeNode | null>(null);
  record = false;

  constructor() {
    this.root = new TreeNode();
    this.root.path = [0];

    this.root.generateNodes(5, 2);
    this.depth.next(this.root.getDepth());
    // interval(100).subscribe(() => {
    //   const randomNode = this.root.getRandomNode();
    //   if (randomNode) {
    //     this.changeCurrentNode(randomNode);
    //   }
    // });
  }

  onCheck(node: TreeNode): void {
    if (this.record) {
      this.history.push(node);
    }
  }

  startRecording(): void {
    this.record = true;
  }

  stopRecording(): void {
    this.record = false;
    console.log(this.history);
  }

  reset(): void {
    this.history.forEach(n => n.changeProps({ checked: false }));
    this.history = [];
  }

  showChecked(): void {
    this.history.forEach(n => n.changeProps({ checked: true }));
  }

  addNode(node: TreeNode): void {
    const currentNode = this.currentNode.value;
    currentNode?.addChild(node);
    this.depth.next(this.root.getDepth());
    // currentNode?.value.component?.markForCheck();
  }

  removeNode(): void {
    const node = this.currentNode.value;
    if (node && node?.parent) {
      node.parent.removeChild(node);
      this.changeCurrentNode(this.getNextAvailableNodeAfterDeletion(node));
      this.depth.next(this.root.getDepth());
      // node?.value.component?.markForCheck();
    }
  }

  getNextAvailableNodeAfterDeletion(removedNode: TreeNode): TreeNode {
    if (removedNode.parent) {
      if (removedNode.parent.children.value.length > 0) {
        return removedNode.parent.children.value[removedNode.parent.children.value.length - 1];
      }
      return removedNode.parent;
    } else {
      throw new Error('removed node does not have a parent');
    }
  }

  changeCurrentNode(node: TreeNode): void {
    const currentNode = this.currentNode.value;
    if (currentNode === node) {
      currentNode.changeProps({ current: !currentNode.getProps().current });
      this.currentNode.next(null);
    } else {
      if (currentNode) {
        currentNode.changeProps({ current: !currentNode.getProps().current });
      }
      node.changeProps({ current: !node.getProps().current });
      this.currentNode.next(node);
    }
  }
}
