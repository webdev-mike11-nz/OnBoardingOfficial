﻿import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Modal, Header, Image, Container, Divider, Grid, Menu, Segment, Icon, Popup , Form, Table, Label, Dropdown } from 'semantic-ui-react';
import $ from 'jquery'; 
import moment from 'moment';

{/* Model class customer */}
class Sales extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            serviceList: [],
            saleList:[]
        };
        
        this.loadData = this.loadData.bind(this);

        // CRUD
        this.add = this.add.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.handleChange= this.handleChange.bind(this); // dropdown to handle values;
        this.handleDate= this.handleDate.bind(this); // date
        this.handleChangeUpdate = this.handleChangeUpdate.bind(this); // for the update operation
        this.fillDropdown = this.fillDropdown.bind(this);
    }


    componentDidMount() {
        this.loadData();   

        // date sets today
        const day = new Date().getDay() +1;
        const month = new Date().getMonth() +1;
        const year = new Date().getFullYear();
        this.setState({
            curTime : day + '-' + month + '-' +  year
        });
    }

    loadData() {        
        //ajax call logic
        fetch('/Sales/GetSalesDetails').then(response => { // dropdowns
            response.json().then(data => {                  
                this.setState({ 
                    serviceList: data,
                    customersList: data[0],
                    productsList: data[1],
                    storesList: data[2],
                });
            })
        });
        
        $.ajax({
            url: '/Sales/GetAllSales',
            dataType: 'json',
            type: 'get',
            contentType: 'application/json',
            beforeSend: function(){ // loading...
                $('#loading').show();
            }
        }).done((data) => {  
            $('#loading').hide();
            this.setState({ 
                saleList: data,
            });
        });
    }
    
    add(e) {
        e.preventDefault();

        // ajax call logic     
        $.ajax({
            url: "/Sales/PostAddOneSale",
            type: "POST",
            dataType: "JSON",
            data: { 
                customerID: this.state.selectCustomer[0].key,
                productID: this.state.selectProduct[0].key,
                storeID:this.state.selectStore[0].key,
                date:this.state.selectDate             
            },
            success: function (data) {
                
                window.location.reload()
               
            },
            error: function(error) {
                console.log(error);
            }
        }); 
    }

    handleChangeUpdate  (e){
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    update(id) {
        //ajax call logic
        let convert = moment(this.state.newDate).format("DD-MM-YYYY") // by default was MM-DD-YYYY
        
        let data= {
            customerID: this.state.selectCustomer[0].key,
            productID: this.state.selectProduct[0].key,
            storeID:this.state.selectStore[0].key,
            dateSold: convert,            
            id : id
        }

        $.ajax({
            url: '/Sales/PostUpdateOneSale',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(data)
        }).done((data) => {
            console.log(data);
            this.setState({
                serviceList: data
            })            
        });
    }

    delete(id) {
        //ajax call logic
        $.ajax({
            url: "/Sales/DeleteOneSale?saleId=" + id,
            type: "POST",
            dataType: "JSON",
            success: function (response) {                 
                window.location.reload()
            },
            error: function(error) {
                alert(error)
            }
        });
    }

    // Handle dropdowns
    handleChange(e,data) // data represents the options with all attributes
    {
        e.preventDefault();
        const { value } = data;
        const { key } = data.options.find(o => o.value === value); // find id
        this.setState({ [data.name] : [{key},{value}] }); // create a list name of the field and [id,value]
    }

    // Handle date
    handleDate(e)
    {
        e.preventDefault();
        this.setState({ [e.target.name] : e.target.value });
    }

    // dynamic list to fill up the dropdown 
    fillDropdown(list){     
        let result = [];
        for (var key in list) {
            result.push({ key: list[key]["Id"] , text: list[key]["Name"], value: list[key]["Name"] })
        }        
        return result;
    }

    render() {        
            
        let serviceList = this.state.serviceList;
        let saleList = this.state.saleList;

        let tableData = null;
        let add_sale = null; // modal to add a sale

        if (serviceList != "") {      
            const { name, value, key } = this.state; // set the value which would be selected into the dropdown
                
            add_sale = <Modal id="modal" trigger={<Button color="blue" id="buttonModal">Add a new sale record</Button>}  >
                                            <Modal.Header >Add a new sale</Modal.Header>
                                            <Modal.Content>
                                                <Form onSubmit={this.add.bind(this)} ref="form" method="POST">
                                                    <Form.Field>
                                                        <label>Select customer</label><br />
                                                        <Dropdown selection options={this.fillDropdown(this.state.customersList)} onChange={this.handleChange} name="selectCustomer" placeholder='Select Customer' /><br />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label>Product name</label><br />
                                                    <Dropdown selection options={this.fillDropdown(this.state.productsList)} onChange={this.handleChange} name="selectProduct" placeholder='Select Product' /><br />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label>Store name</label><br />
                                                    <Dropdown selection options={this.fillDropdown(this.state.storesList)} onChange={this.handleChange} name="selectStore" placeholder='Select Store' /><br />
                                                </Form.Field>
                                                <Form.Field>
                                                    <label>Date</label><br />
                                                    <input type="date"  onChange={this.handleDate} name="selectDate" min={this.state.curTime} required /><br />
                                                </Form.Field>
                                                <Button type='submit'><Icon name="save" />save</Button>         
                                            </Form>
                                        </Modal.Content>
                                    </Modal>
        }
        // the table display all sale records
        if (saleList != "") {
            tableData = saleList.map(service => 
                <Table.Row key={service.Id}>
                    <Table.Cell >{service.Customer.Name}</Table.Cell>
                    <Table.Cell >{service.Product.Name}</Table.Cell>
                    <Table.Cell >{service.Store.Name}</Table.Cell>
                    <Table.Cell >{moment(service.DateSold).format("DD/MM/YYYY")}</Table.Cell>
                        <Table.Cell >
                        <Modal id="modal" trigger={<Button color="yellow"><Icon name="edit" />Edit</Button>}  >
                            <Modal.Header >Details sold</Modal.Header>
                                <Modal.Content> 
                                    <Form ref="form" method="POST" onSubmit={this.update.bind(this,service.Id)}>
                                        <Form.Field>
                                            <label>Customer name</label><br />
                                            <Dropdown selection options={this.fillDropdown(this.state.customersList)} onChange={this.handleChange} name="selectCustomer" placeholder={service.Customer.Name} /><br />                                            
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Product name</label><br />
                                            <Dropdown selection options={this.fillDropdown(this.state.productsList)} onChange={this.handleChange} name="selectProduct" placeholder={service.Product.Name} /><br />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Store name</label><br />
                                            <Dropdown selection options={this.fillDropdown(this.state.storesList)} onChange={this.handleChange} name="selectStore" placeholder={service.Store.Name} /><br />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Date sold</label><br />
                                            <input type="date" name="newDate" onChange={this.handleDate} required /><br />
                                        </Form.Field>
                                        <Button type='submit'><Icon name="save" />save</Button>
                                    </Form>
                            </Modal.Content>
                        </Modal>
                        </Table.Cell>
                        <Table.Cell>
                            <Button color="red" onClick={this.delete.bind(this, service.Id)}><Icon name="trash" />Delete</Button>
                        </Table.Cell>
                    </Table.Row>
                   )
    }
        return (
            <React.Fragment>
                <div>                     
                    {add_sale}                                      
                    <Table celled>
                    <Table.Header>
                        <Table.Row>
                        <Table.HeaderCell>Customer name</Table.HeaderCell>
                        <Table.HeaderCell>Product name</Table.HeaderCell>
                        <Table.HeaderCell>Store name</Table.HeaderCell>
                        <Table.HeaderCell>Date sold</Table.HeaderCell>
                        <Table.HeaderCell>Action (Edit)</Table.HeaderCell>
                        <Table.HeaderCell>Action (Delete)</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {tableData}
                    </Table.Body>
                    <Table.Footer>
                    </Table.Footer>
                    </Table>
                </div>
                <div id="loading"><img id="loading-image" src="/images/ajax-loader.gif" /></div>
            </React.Fragment>      
                )
            }
}





{/* rendering the component */}
const app = document.getElementById('sales');
ReactDOM.render(<div><h1 className="anim">Sales Details</h1><Sales /></div>,app);