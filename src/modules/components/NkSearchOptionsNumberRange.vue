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
    <nk-search-item :label="config.name" :closeable="closeable" @close="close">
        <a-input-group>
            <a-input-number class="i1" v-model="value.from" :placeholder="config.placeholderFrom||config.placeholder"
                            @keydown="keydown" @change="change" :min="config.from" :max="config.to" />
            <a-input-number class="i2"
                            style=" "
                            placeholder="~"
                            disabled
            />
            <a-input-number class="i3" v-model="value.to"   :placeholder="config.placeholderTo||config.placeholder"
                            @keydown="keydown" @change="change" :min="config.from" :max="config.to" />
        </a-input-group>
    </nk-search-item>
</template>

<script>
export default {
    props:{
        config: Object,
        closeable: Boolean
    },
    data(){
        return {
            value: {}
        }
    },
    created() {
        if(this.config.defaultValue){
            this.value = this.config.defaultValue.range[this.config.field]
        }
    },
    methods:{
        setValue(values){
            this.value = (values&&values[this.config.field]&&values[this.config.field].range[this.config.field])||{}
        },
        keydown(e){
            if(e.key==='Enter'){
                this.emit(true);
                e.target.blur();
            }
        },
        change(){
            this.emit(false);
        },
        emit(trigger){
            const value = {
                from:this.value.from || this.value.from===0?this.value.from:this.config.from,
                to:  this.value.to   || this.value.to  ===0?this.value.to:  this.config.to,
            }
            const range = {};
            range[this.config.field]=value;
            this.$emit("changed",{
                field:this.config.field,
                trigger,
                condition:(value.from && value.to)&&{range}
            })
        },
        close(){
            this.$emit("close",this.config);
        }
    }
}
</script>

<style scoped>
::v-deep .ant-input-group{
    padding: 0 3px;
    margin-top: 4px;
}
.i1{
    border-radius: 5px 0 0 5px;
    width: 100px;
}
.i2{
    border-radius: 0;
    width: 30px;
    border-left: 0;
    border-right: 0;
    pointer-events: none;
    background-color: #fff;
}
.i3{
    border-radius: 0 5px 5px 0;
    width: 100px;
}
</style>
