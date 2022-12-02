const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");

require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://"+process.env.USERNAME+":"+process.env.PASSWORD+"@cluster0.ixadnkb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});

const app=express();
app.set('view engine','ejs');

const itemsSchema={
    name:String
};
const Item=mongoose.model("Item",itemsSchema);

const item1= new Item({
    name:"Welcome To Your Do List."
})
const item2= new Item({
    name:"Click The + Button To Add Item."
})
const item3= new Item({
    name:"<-- Hit This To Delete The Item."
})

const defaultitems=[item1,item2,item3];

const ListSChema={
    name:String,
    items:[itemsSchema]
}
const List=mongoose.model("List",ListSChema);
// Item.insertMany(defaultitems,function(err){
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log("Successfully Saved The Items");
//     }
// });

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var count=0;

app.get("/",function(req,res){

    Item.find({},function(err,founditem){
        if(founditem.length===0 && count==00){
            count++;
            Item.insertMany(defaultitems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully Saved Default Items To Database");
                }
            })
            res.redirect("/");
        }
        else{
            // console.log(founditem);
            res.render("list",{listTitle:"Today",newlistitems:founditem});
        }
    })
});
app.post("/",function(req,res){
    var itemname=req.body.newitem;
    let listName=req.body.list;
    // console.log(req);
    const objnew=new Item({
        name:itemname
    });
    if(listName==="Today"){
        objnew.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundlist){
            foundlist.items.push(objnew);
            foundlist.save();
            res.redirect("/"+listName);
        })
    } 
})
app.post("/delete",function(req,res){
    const listName=req.body.listname;
    // console.log(listName);
    const itemid=req.body.deleteitem;
    
    if(listName==="Today"){
        // console.log(req);
        // console.log(itemid);
        Item.deleteOne({_id:itemid},function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Object Deleted Successfully");
            }
        })
        res.redirect("/");
    }    
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemid}}},function(err){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
        
});

app.get("/:customListName",function(req,res){
    // res.send("Hello");
    let text=req.params.customListName;
    text[0]=text[0].toUpperCase();
    const customListName=text;
    List.findOne({name:customListName},function(err,found){
        if(err){
            console.log(err);
        }

        else{
            if(!found){
                console.log("Doesn't Exist");
                //Create A new list
                const list=new List({
                    name:customListName,
                    items:defaultitems
                })
                list.save();
                res.redirect("/"+customListName);
            }
            else
            {
                // console.log("Exists");
                //use the found list
                res.render("list",{listTitle:found.name,newlistitems:found.items})
            }
        }

    })
    
});
app.listen(3000,function(){
    console.log("Server Started On Port 3000");
});