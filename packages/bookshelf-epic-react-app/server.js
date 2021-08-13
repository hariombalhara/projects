const {buildSchema} = require('graphql');

const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const { response } = require('msw');

let schema = buildSchema(`
	type Book {
		id: ID!,
		description: String,
		name: String,
		authors: [String],
		publisher: String,
		cover: String
	}
	type Query {
		hello: String,
		books: [Book]
	}
`)

var app = express();

app.use((req, response, next) => {
	response.setHeader('Access-Control-Allow-Origin', '*')
	response.setHeader('Access-Control-Allow-Headers', '*')
	next();
})

app.options('/graphql', (req, res) => {
	res.status(200).send()
});

app.use('/graphql', graphqlHTTP({
	schema: schema,
	rootValue: {
		hello: () => 'Hello from GraphQL',
		books: () => [
			{
				id: 1,
				name: 'Voice of War',
				cover: 'https://images-na.ssl-images-amazon.com/images/I/41JodZ5Vl%2BL.jpg',
				description: `Chrys Valerian is a threadweaver, a high general, and soon-to-be father. But to the people of Alchea, he is the Apogee—the man who won the war.
	
	When a stranger's prophecy foretells danger to Chrys' child, he must do everything in his power to protect his family—even if the most dangerous enemy is the voice in his own head.
				
	To the west, a sheltered girl seeks to find her place in the world.
				
	To the south, a young man's life changes after he dies.
				
	Together, they will change the world—whether they intend to or not.`,
				publisher: 'Self Published',
				authors: ['Zack Argyle']
			},
			{
				id: 2,
				name: 'Voice of War',
				cover: 'https://images-na.ssl-images-amazon.com/images/I/41JodZ5Vl%2BL.jpg',
				description: `Chrys Valerian is a threadweaver, a high general, and soon-to-be father. But to the people of Alchea, he is the Apogee—the man who won the war.
	
	When a stranger's prophecy foretells danger to Chrys' child, he must do everything in his power to protect his family—even if the most dangerous enemy is the voice in his own head.
				
	To the west, a sheltered girl seeks to find her place in the world.
				
	To the south, a young man's life changes after he dies.
				
	Together, they will change the world—whether they intend to or not.`,
				publisher: 'Self Published',
				authors: ['Zack Argyle']
			}
		]
	},
	graphiql: true
}));

app.listen(9000)