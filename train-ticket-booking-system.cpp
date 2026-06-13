#include <iostream>
#include <string>
using namespace std;

class Train {
public:
    int trainNo;
    string name;
    string from;
    string to;
    int seats;
};

class BookingSystem {
    Train t[3];
    int totalBooked;

public:
    BookingSystem() {
        totalBooked = 0;

        t[0].trainNo = 101;
        t[0].name = "Express";
        t[0].from = "Delhi";
        t[0].to = "Mumbai";
        t[0].seats = 5;

        t[1].trainNo = 102;
        t[1].name = "SuperFast";
        t[1].from = "Chennai";
        t[1].to = "Bangalore";
        t[1].seats = 5;

        t[2].trainNo = 103;
        t[2].name = "Intercity";
        t[2].from = "Kolkata";
        t[2].to = "Patna";
        t[2].seats = 5;
    }

    void displayTrains() {
        cout << "\nTrain Details:\n";
        for (int i = 0; i < 3; i++) {
            cout << "Train No: " << t[i].trainNo << endl;
            cout << "Name: " << t[i].name << endl;
            cout << "From: " << t[i].from << endl;
            cout << "To: " << t[i].to << endl;
            cout << "Available Seats: " << t[i].seats << endl;
            cout << "----------------------\n";
        }
    }

    void bookTicket() {
        int num;
        cout << "Enter train number: ";
        cin >> num;

        for (int i = 0; i < 3; i++) {
            if (t[i].trainNo == num) {
                if (t[i].seats > 0) {
                    t[i].seats--;
                    totalBooked++;
                    cout << "Ticket booked successfully\n";
                } else {
                    cout << "No seats available\n";
                }
                return;
            }
        }
        cout << "Train not found\n";
    }

    void cancelTicket() {
        int num;
        cout << "Enter train number: ";
        cin >> num;

        for (int i = 0; i < 3; i++) {
            if (t[i].trainNo == num) {
                t[i].seats++;
                totalBooked--;
                cout << "Ticket cancelled\n";
                return;
            }
        }
        cout << "Train not found\n";
    }

    void showTotalBooked() {
        cout << "Total tickets booked: " << totalBooked << endl;
    }
};

int main() {
    BookingSystem bs;
    int choice;

    do {
        cout << "\n1. Show Trains";
        cout << "\n2. Book Ticket";
        cout << "\n3. Cancel Ticket";
        cout << "\n4. Total Booked Tickets";
        cout << "\n5. Exit";
        cout << "\nEnter choice: ";
        cin >> choice;

        switch (choice) {
        case 1:
            bs.displayTrains();
            break;
        case 2:
            bs.bookTicket();
            break;
        case 3:
            bs.cancelTicket();
            break;
        case 4:
            bs.showTotalBooked();
            break;
        case 5:
            cout << "Program ended\n";
            break;
        default:
            cout << "Wrong choice\n";
        }
    } while (choice != 5);

    return 0;
}
