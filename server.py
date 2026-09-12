from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

fridge_data = {
    "door": "CLOSED",
    "opens": 0,
    "unnecessary": 0,
    "container1": "LOCKED",
    "container2": "LOCKED"
}


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def files(filename):
    return send_from_directory(".", filename)


@app.route("/update", methods=["POST"])
def update():
    global fridge_data

    data = request.get_json()

    if data:
        fridge_data.update(data)

    print("ESP32 DATA:", fridge_data)

    return jsonify({
        "status": "success"
    })


@app.route("/data")
def data():
    return jsonify(fridge_data)


if __name__ == "__main__":
    print("====================================")
    print(" SLYTHERIN COMMON ROOM SERVER")
    print("====================================")
    print("Website: http://localhost:5000")
    print("")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )