<!--
	This file is part of ELCube.
	ELCube is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	ELCube is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	You should have received a copy of the GNU Affero General Public License
	along with ELCube.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
    <nk-page-layout class="mini" title="流程定义" :loading="loading">
        <nk-form ref="form" size="small" :col="1" slot="content">
            <nk-form-item term="Key">{{processDefinition.key}}</nk-form-item>
            <nk-form-item term="Name">{{processDefinition.name}}</nk-form-item>
            <nk-form-item term="Version">{{processDefinition.version}}</nk-form-item>
        </nk-form>


        <a-button-group slot="action">
            <a-button type="primary" @click="create">编辑</a-button>
        </a-button-group>

        <a-card title="流程图" v-if="processDefinition.xml">
            <div slot="extra">
                <a-button-group size="small">
                    <a-button @click="$refs.bpmn.zoom( 1)">+</a-button>
                    <a-button @click="$refs.bpmn.zoom(-1)">-</a-button>
                </a-button-group>
            </div>
            <nk-bpmn-view ref="bpmn" :bpmn="processDefinition.xml" />
        </a-card>
    </nk-page-layout>
</template>

<script>
import NkBpmnView from "./NkBpmnView";
export default {
    name: "NkDefBpmnProcessDefinitionDetail",
    components:{
        NkBpmnView
    },
    data(){
        return {
            loading: true,
            loadingCanvas: true,
            processDefinition: {},
            diagram: undefined,
            viewer: undefined,
        }
    },
    created() {
        this.loadData();
    },
    mounted(){
    },
    methods:{
        loadData(){
            this.$http.get("/api/def/bpm/process/definition/detail?definitionId="+this.$route.params.id)
                .then(response=>{
                    this.loading = false;
                    this.processDefinition = response.data;
                    this.$emit("setTab",'流程定义:'+this.processDefinition.name);
                });
        },
        create(){
            this.$router.push({
                path:"/apps/def/bpm/process/definitions/designer",
                query:{
                    from:this.processDefinition.id
                }
            })
        }
    },
    destroyed() {
        this.viewer&&this.viewer.destroy&&this.viewer.destroy();
    }
}
</script>

<style scoped>

</style>
