import { randomInt } from './utils';

export class TreeNode<T> {
  parent!: TreeNode<T> | null;
  children!: TreeNode<T>[];
  path!: number[];
  value!: T;

  constructor(parent: TreeNode<T> | null = null, children: TreeNode<T>[] = [], path: number[] = []) {
    this.parent = parent;
    this.children = children;
    this.path = path;
  }

  getDepth(): number {
    const depths: number[] = [];
    this.getNodeDepths(this.children, depths);
    return Math.max(...depths);
  }

  addChild(child: TreeNode<T>, index: number | null = null): void {
    if (index) {
      this.children.splice(index, 0, child);
      child.path = this.createNodePath(index);
      this.nameChildren(this.children, index);
    } else {
      this.children.push(child);
      child.path = this.createNodePath(this.children.length - 1);
    }
  }

  remove(): boolean {
    if (this.parent) {
      this.parent.removeChild(this);
      return true;
    }
    return false;
  }

  generateNodes(depth: number, childrenNum: number, child: TreeNode<T> = this): void {
    if (depth <= 1) {
      return;
    }
    for (let i = 0; i < childrenNum; i++) {
      child.addChild(new TreeNode<T>(child));
    }

    child.children.forEach(n => this.generateNodes(depth - 1, childrenNum, n));
  }

  removeChild(child: TreeNode<T>): void {
    const childIndex = child.path[child.path.length - 1];
    this.children.splice(childIndex, 1);
    this.nameChildren();
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
    let randomNode = new TreeNode<T>(null, [], []);
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

  private copyNode(node: TreeNode<T>): TreeNode<T> {
    return new TreeNode<T>(node, [], [ ...node.path ]);
  }

  private copyNodeRecursive(real: TreeNode<T>, copy: TreeNode<T>): TreeNode<T> {
    real.children.forEach(n => copy.children.push(this.copyNodeRecursive(n, this.copyNode(n))));
    return copy;
  }

  private getNodeDepths(children: TreeNode<T>[], depths: number[], d = 1): void {
    if (children.length === 0) {
      depths.push(d);
      return;
    }
    children.forEach(child => this.getNodeDepths(child.children, depths, d + 1));
  }

  private nameChildren(children: TreeNode<T>[] = this.children, from = 0): void {
    for (let i = from; i < children.length; i++) {
      children[i].path = this.createNodePath(i);
      this.nameChildren(children[i].children, 0);
    }
  }

  // on operation true, stop walking
  private walkOverChildren(operation: (n: TreeNode<T>) => boolean, nodes: TreeNode<T>[] = this.children): void {
    nodes.forEach(n => {
      if (operation(n)) {
        return;
      }
      this.walkOverChildren(operation, n.children);
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
    for (let i = 0; i < node.children.length; i++) {
      if (!this.checkNode(node, i) || !this.checkNodeChildren(node.children[i])) {
        return false;
      }
    }
    return true;
  }

  private checkNode(parent: TreeNode<T>, childIndex: number): boolean {
    const correctPath = this.createNodePath(childIndex, parent);
    const correct = this.comparePaths(parent.path, correctPath);

    if (!correct) {
      console.error(`INCORRECT PATH: ${parent.path[childIndex]}, SHOULD BE: ${correctPath}`);
    }
    return correct;
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
