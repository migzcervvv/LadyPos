import Person from '../models/Person.js';

// Create
export async function createPerson(req, res) {
    try {
        const person = new Person(req.body);
        await person.save();
        res.status(201).json(person);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Read all
export async function getPeople(req, res) {
    try {
        const people = await Person.find({ userId: req.query.userId });
        res.json(people);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Read one
export async function getPersonById(req, res) {
    try {
        const person = await Person.findById(req.params.id);
        if (!person) return res.status(404).json({ error: 'Person not found' });
        res.json(person);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Update
export async function updatePerson(req, res) {
    try {
        const person = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!person) return res.status(404).json({ error: 'Person not found' });
        res.json(person);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Delete
export async function deletePerson(req, res) {
    try {
        const person = await Person.findByIdAndDelete(req.params.id);
        if (!person) return res.status(404).json({ error: 'Person not found' });
        res.json({ message: 'Person deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}