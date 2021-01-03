import { randomInt } from './utils';
import { TreeNodeValue } from './node.service';

export class TreeNode<T> {
  parent: TreeNode<T> | null = null;
  children: TreeNode<T>[] = [];
  path: number[] = [];
  value!: T;

  defaultValue!: T;
  deepCloneValueFunc!: (val: T) => T;
  onValueChange!: (val: T) => void;
  onChildrenChange!: (val: T, children: TreeNode<T>[]) => void;
  patchOnCreation!: (node: TreeNode<T>) => void;

  constructor(
    parent: TreeNode<T> | null = null,
    value: T | null = null,
    children: TreeNode<T>[] = [],
    path: number[] = [],
    patchOnCreation: (node: TreeNode<T>) => void,
  ) {
    this.patchOnCreation = patchOnCreation;
    this.patchOnCreation(this);

    this.parent = parent;
    this.children = children;
    this.path = path;

    if (this.deepCloneValueFunc) {
      this.value = value ? this.deepCloneValueFunc(value) : this.deepCloneValueFunc(this.defaultValue);
    } else {
      this.value = value ? value : this.defaultValue;
    }

    this.onValueChange(this.value);
    this.onChildrenChange(this.value, this.children);
  }

  getDepth(): number {
    const depthsGatherer: number[] = [];
    this.getNodeDepths(this, depthsGatherer);
    return Math.max(...depthsGatherer);
  }

  addChild(child: TreeNode<T>, index: number | null = null): void {
    child.parent = this;
    if (index) {
      this.children.splice(index, 0, child);
      child.path = this.createNodePath(index);
      this.nameChildren(this, index);
    } else {
      this.children.push(child);
      child.path = this.createNodePath(this.children.length - 1);
    }
    this.onChildrenChange(this.value, this.children);
  }

  generateNodes(depth: number, childrenNum: number, child: TreeNode<T> = this): void {
    if (depth <= 1) {
      return;
    }
    for (let i = 0; i < childrenNum; i++) {
      const newChild = new TreeNode<T>(null, this.deepCloneValueFunc(this.defaultValue), [], [], this.patchOnCreation);
      child.addChild(newChild);
    }

    child.children.forEach(n => this.generateNodes(depth - 1, childrenNum, n));
  }

  removeChild(child: TreeNode<T>): void {
    const childIndex = child.path[child.path.length - 1];
    this.children.splice(childIndex, 1);
    this.nameChildren();
    this.onChildrenChange(this.value, this.children);
  }

  copy(): TreeNode<T> {
    return this.copyNodeRecursive(this, this.copyNode(this));
  }

  countNodes(): number {
    let amount = 1;
    this.walkOverChildren(() => {
      amount += 1;
      return false;
    });
    return amount;
  }

  getRandomNode(): TreeNode<T> {
    const randomNodeNum = randomInt(0, this.countNodes());
    if (randomNodeNum === 0) {
      return this;
    }

    let counter = 0;
    let randomNode = new TreeNode<T>(null, this.deepCloneValueFunc(this.defaultValue), [], [], this.patchOnCreation);
    this.walkOverChildren(n => {
      counter++;
      if (counter === randomNodeNum) {
        randomNode = n;
        return true;
      }
      return false;
    });
    return randomNode;
  }

  changeValue(val: Partial<TreeNodeValue>): void {
    this.value = { ...this.value, ...val };
    this.onValueChange(this.value);
  }

  private copyNode(node: TreeNode<T>): TreeNode<T> {
    return new TreeNode<T>(node, this.deepCloneValueFunc(node.value) , [], [...node.path ], this.patchOnCreation);
  }

  private copyNodeRecursive(real: TreeNode<T>, copy: TreeNode<T>): TreeNode<T> {
    real.children.forEach(n => this.copyNodeRecursive(n, this.copyNode(n)));
    return copy;
  }

  private getNodeDepths(node: TreeNode<T>, depthsGatherer: number[], depthCounter = 1): void {
    if (node.children.length === 0) {
      depthsGatherer.push(depthCounter);
      return;
    }
    node.children.forEach(child => this.getNodeDepths(child, depthsGatherer, depthCounter + 1));
  }

  private nameChildren(node: TreeNode<T> = this, from = 0): void {
    node.children.forEach((child, i) => {
      child.path = this.createNodePath(i);
      this.nameChildren(child, 0);
    });
  }

  // on operation true, stop walking
  private walkOverChildren(needToStopFn: (n: TreeNode<T>) => boolean, nodes: TreeNode<T>[] = this.children): void {
    nodes.forEach(n => {
      if (needToStopFn(n)) {
        return;
      }
      this.walkOverChildren(needToStopFn, n.children);
    });
  }

  private createNodePath(index: number, node: TreeNode<T> = this): number[] {
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

  private checkNodeChildren(node: TreeNode<T>): boolean {
    // @ts-ignore
    node.children.forEach((child, i) => {
      if (!this.checkNode(node, i) || !this.checkNodeChildren(child)) {
        return false;
      }
    });
    return true;
  }

  private checkNode(parent: TreeNode<T>, childIndex: number): boolean {
    const correctPath = this.createNodePath(childIndex, parent);
    const samePaths = this.comparePaths(parent.path, correctPath);

    if (!samePaths) {
      console.error(`INCORRECT PATH: ${parent.path[childIndex]}, SHOULD BE: ${correctPath}`);
    }
    return samePaths;
  }

  findNode(node: TreeNode<T>): TreeNode<T> | null {
    if (this.path.length === node.path.length) {
      return this;
    }

    if (this.path.length > node.path.length) {
      return null;
    }

    let children = this.children;
    for (let i = this.path.length; i < node.path.length - 1; i++) {
      children = children[node.path[i]].children;
    }
    return children[node.path[node.path.length - 1]];
  }
}
