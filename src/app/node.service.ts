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
    this.root.generateNodes(3, 3);
    this.depth.next(this.root.getDepth());
    console.log(this.root.countNodes());
    // interval(100).subscribe(() => {
    //   const randomNode = this.root.getRandomNode();
    //   if (randomNode) {
    //     this.changeCurrentNode(randomNode);
    //   }
    // });
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
      } else if (node.parent) {
        this.changeCurrentNode(node.parent);
      }
      this.depth.next(this.root.getDepth());
      node?.value.markForCheck();
    }
  }

  changeCurrentNode(node: TreeNode<TreeNodeComponent>): void {
    const currentNode = this.currentNode.value;
    if (currentNode === node) {
      currentNode.value.current = !currentNode.value.current;
      this.currentNode.next(null);
      currentNode?.value.markForCheck();
    } else {
      if (currentNode) {
        currentNode.value.current = false;
        currentNode?.value.markForCheck();
        // currentNode?.value.onCurrentChange('1');
      }
      node.value.current = true;
      node?.value.markForCheck();
      this.currentNode.next(node);
      // node.value.onCurrentChange('0.5');
      node.value.onRemove();
    }
  }

  createFirstNode(): TreeNode<TreeNodeComponent>  {
    return new TreeNode<TreeNodeComponent>(null, [], [0]);
  }
}
