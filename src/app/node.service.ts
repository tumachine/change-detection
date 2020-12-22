import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { TreeNode } from './node';
import { TreeNodeComponent } from './tree/tree-node/tree-node.component';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  root!: TreeNode<TreeNodeComponent>;
  history: string[] = [];
  depth = new BehaviorSubject<number>(0);
  currentNode = new BehaviorSubject<TreeNode<TreeNodeComponent> | null>(null);

  constructor() {
    this.root = this.createFirstNode();
    this.root.generateNodes(5, 2);
    this.depth.next(this.root.getDepth());
    // interval(500).subscribe(() => this.changeCurrentNode(this.root));
  }

  onCheck(name: string): void {
    this.history.push(name);
    console.log(this.history);
  }

  reset(): void {
    this.history = [];
  }

  addNode(node: TreeNode<TreeNodeComponent>): void {
    const currentNode = this.currentNode.value;
    currentNode?.addChild(new TreeNode(node));
    this.depth.next(this.root.getDepth());
    currentNode?.value.markForCheck();
  }

  removeNode(): void {
    const node = this.currentNode.value;
    if (node && node?.parent) {
      node.remove();
      if (node.parent.children.length > 0) {
        const leftChild = node.parent.children[node.parent.children.length - 1];
        this.changeCurrentNode(leftChild);
        // leftChild?.value.markForCheck();
        console.log('left');
      } else if (node.parent) {
        this.changeCurrentNode(node.parent);
        console.log('parent');
      }
      this.depth.next(this.root.getDepth());
      node?.value.markForCheck();
    }
  }

  changeCurrentNode(node: TreeNode<TreeNodeComponent>): void {
    const currentNode = this.currentNode.value;
    if (currentNode === node) {
      currentNode.changeState({ current: !currentNode.state.current });
      this.currentNode.next(null);
      currentNode?.value.markForCheck();
    } else {
      if (currentNode) {
        currentNode.changeState({ current: false });
        currentNode?.value.markForCheck();
      }
      node.changeState({ current: true });
      node?.value.markForCheck();
      this.currentNode.next(node);
    }
  }

  createFirstNode(): TreeNode<TreeNodeComponent>  {
    return new TreeNode<TreeNodeComponent>(null, [], [0]);
  }
}
