import * as SRD from "storm-react-diagrams";
import {SimplePortFactory} from "./NodeModels/SimplePortFactory";
import {CircleStartPortModel} from "./NodeModels/StartNode/CircleStartPortModel";
import {CircleStartNodeFactory} from "./NodeModels/StartNode/CircleStartNodeFactory";
import {CircleEndPortModel} from "./NodeModels/EndNode/CircleEndPortModel";
import {CircleEndNodeFactory} from "./NodeModels/EndNode/CircleEndNodeFactory";
import {ForkNodeFactory} from "./NodeModels/ForkNode/ForkNodeFactory";
import {ForkNodePortModel} from "./NodeModels/ForkNode/ForkNodePortModel";
import {JoinNodePortModel} from "./NodeModels/JoinNode/JoinNodePortModel";
import {JoinNodeFactory} from "./NodeModels/JoinNode/JoinNodeFactory";

export class Application {

    activeModel: SRD.DiagramModel;
    diagramEngine: SRD.DiagramEngine;

    constructor() {
        this.diagramEngine = new SRD.DiagramEngine();
        this.diagramEngine.installDefaultFactories();

        this.diagramEngine.registerPortFactory(new SimplePortFactory("start", config => new CircleStartPortModel()));
        this.diagramEngine.registerPortFactory(new SimplePortFactory("end", config => new CircleEndPortModel()));
        this.diagramEngine.registerPortFactory(new SimplePortFactory("fork", config => new ForkNodePortModel()));
        this.diagramEngine.registerPortFactory(new SimplePortFactory("join", config => new JoinNodePortModel()));


        this.diagramEngine.registerNodeFactory(new CircleStartNodeFactory());
        this.diagramEngine.registerNodeFactory(new CircleEndNodeFactory());
        this.diagramEngine.registerNodeFactory(new ForkNodeFactory());
        this.diagramEngine.registerNodeFactory(new JoinNodeFactory());

    }

    getActiveDiagram(): SRD.DiagramModel {
        return this.activeModel;
    }

    getDiagramEngine(): SRD.DiagramEngine {
        return this.diagramEngine;
    }
}
